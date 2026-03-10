import { useCallback, useEffect, useRef, useState } from "react";

const CELL = 20;
const COLS = 20;
const ROWS = 20;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ] as Point[],
    dir: "RIGHT" as Dir,
    nextDir: "RIGHT" as Dir,
    food: { x: 15, y: 10 } as Point,
    score: 0,
    gameOver: false,
    running: false,
  });
  const frameRef = useRef(0);
  const lastTickRef = useRef(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    // Background
    ctx.fillStyle = "#05050a";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    // Grid
    ctx.strokeStyle = "rgba(40, 80, 120, 0.2)";
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(COLS * CELL, r * CELL);
      ctx.stroke();
    }

    // Food
    const fx = s.food.x * CELL + CELL / 2;
    const fy = s.food.y * CELL + CELL / 2;
    const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, CELL / 2);
    grad.addColorStop(0, "hsl(190, 100%, 80%)");
    grad.addColorStop(1, "hsl(190, 100%, 50%)");
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Food glow
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "hsl(190, 100%, 70%)";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Snake
    for (let i = 0; i < s.snake.length; i++) {
      const seg = s.snake[i];
      const isHead = i === 0;
      const ratio = 1 - i / s.snake.length;
      const hue = isHead ? 210 : 200;
      const lightness = isHead ? 70 : 45 + ratio * 20;
      const alpha = isHead ? 1 : 0.5 + ratio * 0.5;

      ctx.globalAlpha = alpha;
      if (isHead) {
        // Glowing head
        ctx.shadowColor = "hsl(210, 100%, 60%)";
        ctx.shadowBlur = 12;
      }
      const inset = isHead ? 1 : 2;
      const r = isHead ? 6 : 4;
      ctx.fillStyle = `hsl(${hue}, 90%, ${lightness}%)`;
      const rx = seg.x * CELL + inset;
      const ry = seg.y * CELL + inset;
      const rw = CELL - inset * 2;
      const rh = CELL - inset * 2;
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, r);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Game over overlay
    if (s.gameOver) {
      ctx.fillStyle = "rgba(5, 5, 10, 0.7)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.fillStyle = "hsl(210, 90%, 70%)";
      ctx.font = "bold 28px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", (COLS * CELL) / 2, (ROWS * CELL) / 2 - 20);
      ctx.font = "16px 'JetBrains Mono', monospace";
      ctx.fillStyle = "hsl(190, 80%, 65%)";
      ctx.fillText(
        `Score: ${s.score}`,
        (COLS * CELL) / 2,
        (ROWS * CELL) / 2 + 10,
      );
      ctx.font = "14px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(
        "Press SPACE to restart",
        (COLS * CELL) / 2,
        (ROWS * CELL) / 2 + 40,
      );
    }

    // Not started
    if (!s.running && !s.gameOver) {
      ctx.fillStyle = "rgba(5, 5, 10, 0.7)";
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.fillStyle = "hsl(210, 90%, 70%)";
      ctx.font = "bold 22px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("SNAKE", (COLS * CELL) / 2, (ROWS * CELL) / 2 - 20);
      ctx.font = "14px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(
        "Press SPACE to start",
        (COLS * CELL) / 2,
        (ROWS * CELL) / 2 + 15,
      );
    }
  }, []);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.running) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      const speed = Math.max(80, 200 - s.score * 5);
      if (now - lastTickRef.current >= speed) {
        lastTickRef.current = now;
        s.dir = s.nextDir;
        const head = s.snake[0];
        const newHead: Point = {
          x:
            (head.x +
              (s.dir === "RIGHT" ? 1 : s.dir === "LEFT" ? -1 : 0) +
              COLS) %
            COLS,
          y:
            (head.y + (s.dir === "DOWN" ? 1 : s.dir === "UP" ? -1 : 0) + ROWS) %
            ROWS,
        };
        // Collision with self
        if (
          s.snake
            .slice(1)
            .some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          s.gameOver = true;
          s.running = false;
          setGameOver(true);
          draw();
          return;
        }
        const ate = newHead.x === s.food.x && newHead.y === s.food.y;
        s.snake = [newHead, ...s.snake];
        if (!ate) s.snake.pop();
        else {
          s.food = randomFood(s.snake);
          s.score++;
          setScore(s.score);
        }
      }
      draw();
      frameRef.current = requestAnimationFrame(tick);
    },
    [draw],
  );

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    s.dir = "RIGHT";
    s.nextDir = "RIGHT";
    s.food = randomFood(s.snake);
    s.score = 0;
    s.gameOver = false;
    s.running = true;
    setScore(0);
    setGameOver(false);
    setStarted(true);
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(tick);
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [tick, draw]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const dirMap: Record<string, Dir> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
      };
      if (e.key === " ") {
        e.preventDefault();
        if (!s.running && !s.gameOver) {
          reset();
        } else if (s.gameOver) {
          reset();
        }
        return;
      }
      const newDir = dirMap[e.key];
      if (!newDir) return;
      e.preventDefault();
      const opposites: Record<Dir, Dir> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };
      if (opposites[newDir] !== s.dir) {
        s.nextDir = newDir;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [reset]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Score */}
      <div className="flex items-center gap-6 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">SCORE</span>
          <span
            className="text-neon-cyan font-bold text-xl"
            style={{ textShadow: "0 0 12px oklch(0.68 0.24 195)" }}
          >
            {score}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">SPEED</span>
          <span className="text-neon-blue font-bold text-sm">
            {Math.min(10, Math.floor(score / 3) + 1)}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          boxShadow:
            "0 0 30px oklch(0.72 0.22 220 / 0.3), 0 0 60px oklch(0.68 0.24 195 / 0.1), inset 0 0 0 1px oklch(0.72 0.22 220 / 0.3)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          data-ocid="game.canvas_target"
          className="block"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3 text-xs text-muted-foreground font-mono">
        <span>↑↓←→ or WASD to move</span>
        <span>•</span>
        <span>SPACE to {started ? "restart" : "start"}</span>
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-1 mt-1 md:hidden">
        <div />
        <button
          type="button"
          className="w-10 h-10 rounded glass-card flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
          onClick={() => {
            const s = stateRef.current;
            if (s.dir !== "DOWN") s.nextDir = "UP";
          }}
        >
          ↑
        </button>
        <div />
        <button
          type="button"
          className="w-10 h-10 rounded glass-card flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
          onClick={() => {
            const s = stateRef.current;
            if (s.dir !== "RIGHT") s.nextDir = "LEFT";
          }}
        >
          ←
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded glass-card flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
          onClick={() => {
            const s = stateRef.current;
            if (s.dir !== "UP") s.nextDir = "DOWN";
          }}
        >
          ↓
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded glass-card flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
          onClick={() => {
            const s = stateRef.current;
            if (s.dir !== "LEFT") s.nextDir = "RIGHT";
          }}
        >
          →
        </button>
      </div>

      {gameOver && (
        <button
          type="button"
          onClick={reset}
          className="mt-2 px-6 py-2 rounded-lg font-bold text-sm font-mono transition-all hover:scale-105"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.22 220), oklch(0.68 0.24 195))",
            color: "oklch(0.05 0.02 265)",
            boxShadow: "0 0 20px oklch(0.72 0.22 220 / 0.4)",
          }}
        >
          PLAY AGAIN
        </button>
      )}
      {!started && !gameOver && (
        <button
          type="button"
          onClick={reset}
          className="mt-2 px-6 py-2 rounded-lg font-bold text-sm font-mono transition-all hover:scale-105"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.22 220), oklch(0.68 0.24 195))",
            color: "oklch(0.05 0.02 265)",
            boxShadow: "0 0 20px oklch(0.72 0.22 220 / 0.4)",
          }}
        >
          START GAME
        </button>
      )}
    </div>
  );
}
