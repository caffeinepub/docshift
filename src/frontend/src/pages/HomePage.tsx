import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Gamepad2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { LiveCanvas } from "../components/LiveCanvas";

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Title update
    document.title = "DocShift — Transform any document, instantly.";
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Live Canvas Background */}
      <LiveCanvas />

      {/* Gradient overlay for readability */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse at center, transparent 0%, oklch(0.08 0.005 265 / 0.4) 60%, oklch(0.08 0.005 265 / 0.8) 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative flex flex-col min-h-screen"
        style={{ zIndex: 2 }}
      >
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.22 220), oklch(0.68 0.24 195))",
                boxShadow: "0 0 16px oklch(0.72 0.22 220 / 0.5)",
              }}
            >
              <FileText
                className="w-4 h-4"
                style={{ color: "oklch(0.05 0.02 265)" }}
              />
            </div>
            <span
              className="font-display font-bold text-xl tracking-tight"
              style={{ color: "oklch(0.95 0.01 265)" }}
            >
              DocShift
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link
              to="/convert"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              Converter
            </Link>
            <Link
              to="/convert"
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{
                border: "1px solid oklch(0.72 0.22 220 / 0.5)",
                color: "oklch(0.72 0.22 220)",
              }}
              data-ocid="nav.primary_button"
            >
              Get Started
            </Link>
          </motion.div>
        </nav>

        {/* Hero */}
        <main
          className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          ref={heroRef}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono mb-8"
              style={{
                background: "oklch(0.72 0.22 220 / 0.1)",
                border: "1px solid oklch(0.72 0.22 220 / 0.3)",
                color: "oklch(0.72 0.22 220)",
              }}
            >
              <Zap className="w-3 h-3" />
              Instant Format Conversion
            </div>

            {/* Title */}
            <h1
              className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-none mb-6"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.95 0.01 265) 0%, oklch(0.72 0.22 220) 40%, oklch(0.68 0.24 195) 70%, oklch(0.75 0.20 285) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 40px oklch(0.72 0.22 220 / 0.3))",
              }}
            >
              DocShift
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl md:text-2xl font-body mb-4 max-w-2xl mx-auto"
              style={{ color: "oklch(0.75 0.04 265)" }}
            >
              Transform any document, instantly.
            </p>
            <p
              className="text-base md:text-lg font-body mb-12 max-w-xl mx-auto"
              style={{ color: "oklch(0.55 0.04 265)" }}
            >
              PDF, DOCX, TXT, HTML, CSV, XLSX and more — all formats, zero
              friction.
              <br />
              And a mini-game to keep you entertained while it converts.
            </p>

            {/* CTA */}
            <Link to="/convert" data-ocid="hero.primary_button">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-lg transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.22 220), oklch(0.68 0.24 195))",
                  color: "oklch(0.05 0.02 265)",
                  boxShadow:
                    "0 0 30px oklch(0.72 0.22 220 / 0.5), 0 0 80px oklch(0.72 0.22 220 / 0.2)",
                }}
              >
                Start Converting
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-3 mt-12"
            >
              {[
                { icon: "📄", label: "PDF" },
                { icon: "📝", label: "DOCX" },
                { icon: "🌐", label: "HTML" },
                { icon: "📊", label: "CSV" },
                { icon: "🖼️", label: "PNG/JPG" },
                { icon: "📋", label: "TXT" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                  style={{
                    background: "oklch(0.14 0.02 265 / 0.8)",
                    border: "1px solid oklch(0.25 0.04 265)",
                    color: "oklch(0.7 0.04 265)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span>{f.icon}</span>
                  <span className="font-mono text-xs">{f.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </main>

        {/* Features strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="px-6 pb-12 md:px-12"
        >
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Lightning Fast",
                desc: "Conversions complete in seconds, not minutes.",
                color: "oklch(0.72 0.22 220)",
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: "9 Formats",
                desc: "PDF, DOCX, TXT, HTML, MD, PNG, JPG, CSV, XLSX.",
                color: "oklch(0.68 0.24 195)",
              },
              {
                icon: <Gamepad2 className="w-5 h-5" />,
                title: "Play While You Wait",
                desc: "A built-in Snake game so you're never bored.",
                color: "oklch(0.75 0.20 285)",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="glass-card rounded-2xl p-5 flex items-start gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: feat.color.replace(")", " / 0.15)"),
                    color: feat.color,
                  }}
                >
                  {feat.icon}
                </div>
                <div>
                  <div
                    className="font-display font-bold text-sm mb-1"
                    style={{ color: "oklch(0.9 0.02 265)" }}
                  >
                    {feat.title}
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.55 0.04 265)" }}
                  >
                    {feat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <footer
          className="py-4 px-6 text-center text-xs"
          style={{ color: "oklch(0.38 0.03 265)", zIndex: 2 }}
        >
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
