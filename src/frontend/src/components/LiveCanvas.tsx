import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface DotGrid {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  ripple: number;
}

export function LiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const dotsRef = useRef<DotGrid[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const COLS = 24;
    const ROWS = 14;

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Rebuild dot grid
      dotsRef.current = [];
      const colGap = width / COLS;
      const rowGap = height / ROWS;
      for (let c = 0; c <= COLS; c++) {
        for (let r = 0; r <= ROWS; r++) {
          dotsRef.current.push({
            x: c * colGap,
            y: r * rowGap,
            baseX: c * colGap,
            baseY: r * rowGap,
            ripple: 0,
          });
        }
      }
    }

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    function spawnParticle() {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.7;
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 200 + Math.random() * 300,
        size: 1 + Math.random() * 2,
        hue: 180 + Math.random() * 80,
      });
    }

    for (let i = 0; i < 80; i++) spawnParticle();

    function drawConcentricRings(t: number) {
      if (!ctx) return;
      const cx = width / 2;
      const cy = height / 2;
      const count = 10;
      for (let i = 0; i < count; i++) {
        const phase = (i / count) * Math.PI * 2;
        const baseR = 60 + i * 55;
        const pulse = Math.sin(t * 0.8 + phase) * 15;
        const r = baseR + pulse;
        const rotation = t * 0.2 * (i % 2 === 0 ? 1 : -1);
        const alpha = 0.08 + Math.sin(t * 0.5 + phase) * 0.04;
        const hue = 200 + i * 8;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.beginPath();
        const segments = 6 + i * 2;
        for (let s = 0; s < segments; s++) {
          const a = (s / segments) * Math.PI * 2;
          const wobble = Math.sin(a * 3 + t * 1.2 + phase) * 8;
          const rx = (r + wobble) * Math.cos(a);
          const ry = (r + wobble) * Math.sin(a);
          if (s === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.closePath();
        ctx.strokeStyle = `hsl(${hue}, 90%, 65%)`;
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha;
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    function drawParticles(t: number) {
      if (!ctx) return;
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        // Sine wave drift
        p.x += p.vx + Math.sin(t * 0.5 + p.y * 0.01) * 0.2;
        p.y += p.vy + Math.cos(t * 0.3 + p.x * 0.01) * 0.15;
        p.life++;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        if (p.life > p.maxLife) {
          particlesRef.current.splice(i, 1);
          spawnParticle();
          continue;
        }

        const lifeRatio = p.life / p.maxLife;
        const alpha = Math.sin(lifeRatio * Math.PI) * 0.6;
        const brightness = 60 + Math.sin(t * 0.5 + p.hue) * 15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 90%, ${brightness}%)`;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawDotGrid() {
      if (!ctx) return;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const RADIUS = 150;

      for (const dot of dotsRef.current) {
        const dx = dot.baseX - mx;
        const dy = dot.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS) {
          const force = (1 - dist / RADIUS) * 12;
          dot.x = dot.baseX + (dx / dist) * force;
          dot.y = dot.baseY + (dy / dist) * force;
          dot.ripple = 1;
        } else {
          dot.x += (dot.baseX - dot.x) * 0.1;
          dot.y += (dot.baseY - dot.y) * 0.1;
          dot.ripple *= 0.95;
        }

        const alpha = 0.1 + dot.ripple * 0.5;
        const size = 1.5 + dot.ripple * 2;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(210, 90%, 70%)";
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawMorphingShapes(t: number) {
      if (!ctx) return;
      const shapes = [
        { x: width * 0.15, y: height * 0.2, r: 80, speed: 0.3 },
        { x: width * 0.85, y: height * 0.25, r: 60, speed: 0.5 },
        { x: width * 0.1, y: height * 0.8, r: 70, speed: 0.4 },
        { x: width * 0.9, y: height * 0.75, r: 90, speed: 0.25 },
        { x: width * 0.5, y: height * 0.9, r: 50, speed: 0.6 },
      ];

      for (const s of shapes) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(t * s.speed);
        ctx.beginPath();
        const sides = 3 + Math.floor(Math.sin(t * s.speed * 0.5) * 1.5 + 1.5);
        for (let i = 0; i <= sides; i++) {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
          const wobble = 1 + Math.sin(i * 2.1 + t * s.speed * 3) * 0.15;
          const rx = Math.cos(angle) * s.r * wobble;
          const ry = Math.sin(angle) * s.r * wobble;
          if (i === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.closePath();
        ctx.strokeStyle = "hsl(260, 80%, 65%)";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.06;
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    function drawScanlines() {
      if (!ctx) return;
      const lineSpacing = 4;
      ctx.globalAlpha = 0.025;
      ctx.fillStyle = "#000";
      for (let y = 0; y < height; y += lineSpacing) {
        ctx.fillRect(0, y, width, 1);
      }
      ctx.globalAlpha = 1;
    }

    function animate() {
      if (!ctx || !canvas) return;
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Background with trail
      ctx.fillStyle = "rgba(8, 8, 14, 0.15)";
      ctx.fillRect(0, 0, width, height);

      drawMorphingShapes(t);
      drawConcentricRings(t);
      drawParticles(t);
      drawDotGrid();
      drawScanlines();

      frameRef.current = requestAnimationFrame(animate);
    }

    // Fill black initially
    ctx.fillStyle = "rgb(8, 8, 14)";
    ctx.fillRect(0, 0, width, height);

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
