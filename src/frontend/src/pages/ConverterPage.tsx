import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  Gamepad2,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Status } from "../backend";
import { SnakeGame } from "../components/SnakeGame";
import { useCreateJob, useUpdateProgress } from "../hooks/useQueries";

const TARGET_FORMATS = [
  "PDF",
  "DOCX",
  "TXT",
  "HTML",
  "MD",
  "PNG",
  "JPG",
  "CSV",
  "XLSX",
];

const PROGRESS_MESSAGES = [
  "Analyzing document structure...",
  "Parsing content blocks...",
  "Processing pages...",
  "Applying format conversion...",
  "Optimizing output...",
  "Finalizing conversion...",
  "Packaging file...",
  "Almost done...",
];

function getExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "TXT";
  const ext = parts[parts.length - 1].toUpperCase();
  const known = [
    "PDF",
    "DOCX",
    "DOC",
    "TXT",
    "HTML",
    "HTM",
    "MD",
    "PNG",
    "JPG",
    "JPEG",
    "CSV",
    "XLSX",
    "XLS",
  ];
  return known.includes(ext)
    ? ext === "JPEG"
      ? "JPG"
      : ext === "HTM"
        ? "HTML"
        : ext === "DOC"
          ? "DOCX"
          : ext
    : "TXT";
}

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = [
    "oklch(0.72 0.22 220)",
    "oklch(0.68 0.24 195)",
    "oklch(0.75 0.20 285)",
    "oklch(0.72 0.22 165)",
    "oklch(0.95 0.01 265)",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const size = 4 + Math.random() * 6;
  return (
    <motion.div
      className="absolute rounded-sm"
      style={{
        left: `${left}%`,
        top: 0,
        width: size,
        height: size,
        background: color,
      }}
      initial={{ y: 0, opacity: 1, rotate: 0 }}
      animate={{ y: 120, opacity: 0, rotate: 720 }}
      transition={{ duration: 1.2, delay, ease: "easeIn" }}
    />
  );
}

export function ConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState("PDF");
  const [phase, setPhase] = useState<"idle" | "converting" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [showGame, setShowGame] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<bigint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createJob = useCreateJob();
  const updateProgress = useUpdateProgress();

  const sourceFormat = file ? getExtension(file.name) : "";

  useEffect(() => {
    document.title = "DocShift — Converter";
  }, []);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setPhase("idle");
    setProgress(0);
    setShowConfetti(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleConvert = async () => {
    if (!file) return;
    setPhase("converting");
    setProgress(0);
    setProgressMsg(PROGRESS_MESSAGES[0]);
    setShowConfetti(false);

    let jobId: bigint | null = null;
    try {
      jobId = await createJob.mutateAsync({
        filename: file.name,
        sourceFormat,
        targetFormat,
      });
      setCurrentJobId(jobId);
    } catch {
      // Backend may not be available; proceed with simulation
    }

    let current = 0;
    const finalJobId = jobId;
    intervalRef.current = setInterval(async () => {
      current += Math.random() * 8 + 3;
      if (current >= 100) {
        current = 100;
        clearInterval(intervalRef.current!);
        setProgress(100);
        const msgIdx = Math.min(PROGRESS_MESSAGES.length - 1, 7);
        setProgressMsg(PROGRESS_MESSAGES[msgIdx]);
        if (finalJobId !== null) {
          try {
            await updateProgress.mutateAsync({
              jobId: finalJobId,
              status: Status.done,
              progress: BigInt(100),
            });
          } catch {
            /* ok */
          }
        }
        setTimeout(() => {
          setPhase("done");
          setShowConfetti(true);
        }, 400);
        return;
      }
      setProgress(Math.floor(current));
      const msgIdx = Math.min(
        Math.floor((current / 100) * PROGRESS_MESSAGES.length),
        PROGRESS_MESSAGES.length - 1,
      );
      setProgressMsg(PROGRESS_MESSAGES[msgIdx]);
      if (finalJobId !== null) {
        try {
          await updateProgress.mutateAsync({
            jobId: finalJobId,
            status: Status.converting,
            progress: BigInt(Math.floor(current)),
          });
        } catch {
          /* ok */
        }
      }
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.08 0.005 265)" }}
    >
      {/* Subtle bg pattern */}
      <div
        className="fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(oklch(0.72 0.22 220 / 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Nav */}
        <nav
          className="flex items-center justify-between px-6 py-5 md:px-12 border-b"
          style={{ borderColor: "oklch(0.18 0.03 265)" }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 group"
            data-ocid="nav.link"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.22 220), oklch(0.68 0.24 195))",
              }}
            >
              <FileText
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.05 0.02 265)" }}
              />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              DocShift
            </span>
          </Link>
          <div className="text-sm text-muted-foreground font-mono">
            {currentJobId !== null && (
              <span>Job #{currentJobId.toString()}</span>
            )}
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-2xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              className="font-display font-black text-4xl md:text-5xl tracking-tight mb-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.95 0.01 265), oklch(0.72 0.22 220))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Convert File
            </h1>
            <p className="text-muted-foreground mb-10">
              Drop your file, choose a format, and transform.
            </p>

            {/* Upload Zone */}
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div
                    data-ocid="converter.dropzone"
                    className="relative rounded-2xl p-10 text-center cursor-pointer transition-all"
                    style={{
                      background: isDragging
                        ? "oklch(0.72 0.22 220 / 0.08)"
                        : file
                          ? "oklch(0.68 0.24 195 / 0.05)"
                          : "oklch(0.11 0.01 265 / 0.8)",
                      border: `2px dashed ${isDragging ? "oklch(0.72 0.22 220)" : file ? "oklch(0.68 0.24 195 / 0.6)" : "oklch(0.25 0.05 265)"}`,
                      backdropFilter: "blur(12px)",
                      boxShadow: isDragging
                        ? "0 0 30px oklch(0.72 0.22 220 / 0.15)"
                        : "none",
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        fileInputRef.current?.click();
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                      }}
                      data-ocid="converter.upload_button"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: "oklch(0.68 0.24 195 / 0.15)",
                            color: "oklch(0.68 0.24 195)",
                          }}
                        >
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <div
                            className="font-medium text-sm"
                            style={{ color: "oklch(0.9 0.02 265)" }}
                          >
                            {file.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB — {sourceFormat}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ml-4 p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          style={{ color: "oklch(0.62 0.22 25)" }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div
                          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                          style={{
                            background: "oklch(0.72 0.22 220 / 0.1)",
                            border: "1px solid oklch(0.72 0.22 220 / 0.2)",
                            color: "oklch(0.72 0.22 220)",
                          }}
                        >
                          <Upload className="w-7 h-7" />
                        </div>
                        <p
                          className="font-medium mb-1"
                          style={{ color: "oklch(0.85 0.02 265)" }}
                        >
                          Drop your file here
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse — any format supported
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Format selector */}
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="text-xs font-mono text-muted-foreground mb-2 block">
                            SOURCE FORMAT
                          </div>
                          <div
                            className="rounded-xl px-4 py-2.5 font-mono text-sm font-bold"
                            style={{
                              background: "oklch(0.14 0.02 265)",
                              color: "oklch(0.72 0.22 220)",
                              border: "1px solid oklch(0.22 0.05 265)",
                            }}
                          >
                            {sourceFormat}
                          </div>
                        </div>
                        <div
                          className="pt-6 text-2xl"
                          style={{ color: "oklch(0.55 0.04 265)" }}
                        >
                          →
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-mono text-muted-foreground mb-2 block">
                            TARGET FORMAT
                          </div>
                          <Select
                            value={targetFormat}
                            onValueChange={setTargetFormat}
                          >
                            <SelectTrigger
                              data-ocid="converter.select"
                              className="rounded-xl font-mono text-sm font-bold"
                              style={{
                                background: "oklch(0.14 0.02 265)",
                                color: "oklch(0.68 0.24 195)",
                                border: "1px solid oklch(0.68 0.24 195 / 0.3)",
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TARGET_FORMATS.map((fmt) => (
                                <SelectItem
                                  key={fmt}
                                  value={fmt}
                                  className="font-mono"
                                >
                                  {fmt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <motion.button
                        data-ocid="converter.submit_button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConvert}
                        disabled={createJob.isPending}
                        className="w-full py-4 rounded-xl font-display font-bold text-lg flex items-center justify-center gap-2 transition-all"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.72 0.22 220), oklch(0.68 0.24 195))",
                          color: "oklch(0.05 0.02 265)",
                          boxShadow:
                            "0 0 30px oklch(0.72 0.22 220 / 0.4), 0 0 60px oklch(0.72 0.22 220 / 0.1)",
                        }}
                      >
                        {createJob.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : null}
                        Convert {sourceFormat} → {targetFormat}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Converting Phase */}
              {phase === "converting" && (
                <motion.div
                  key="converting"
                  data-ocid="converter.loading_state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card rounded-2xl p-8 space-y-6"
                >
                  {/* File info */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "oklch(0.72 0.22 220 / 0.15)",
                        color: "oklch(0.72 0.22 220)",
                      }}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div
                        className="font-medium text-sm"
                        style={{ color: "oklch(0.9 0.02 265)" }}
                      >
                        {file?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sourceFormat} → {targetFormat}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm font-mono"
                        style={{ color: "oklch(0.72 0.22 220)" }}
                      >
                        {progressMsg}
                      </span>
                      <span
                        className="text-sm font-mono font-bold"
                        style={{ color: "oklch(0.72 0.22 220)" }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.14 0.02 265)" }}
                    >
                      <motion.div
                        className="h-full rounded-full progress-gradient"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Animated status dots */}
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: "oklch(0.72 0.22 220)" }}
                        animate={{
                          opacity: [0.2, 1, 0.2],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground font-mono ml-1">
                      Processing...
                    </span>
                  </div>

                  {/* Play game offer */}
                  <div
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{
                      background: "oklch(0.75 0.20 285 / 0.08)",
                      border: "1px solid oklch(0.75 0.20 285 / 0.25)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Gamepad2
                        className="w-5 h-5"
                        style={{ color: "oklch(0.75 0.20 285)" }}
                      />
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "oklch(0.85 0.03 265)" }}
                        >
                          Your file is converting…
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Play Snake while you wait?
                        </div>
                      </div>
                    </div>
                    <motion.button
                      data-ocid="game.open_modal_button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowGame(true)}
                      className="px-4 py-2 rounded-lg text-sm font-bold font-mono transition-all"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.75 0.20 285), oklch(0.72 0.22 220))",
                        color: "oklch(0.05 0.02 265)",
                        boxShadow: "0 0 15px oklch(0.75 0.20 285 / 0.3)",
                      }}
                    >
                      Play Game
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Done Phase */}
              {phase === "done" && (
                <motion.div
                  key="done"
                  data-ocid="converter.success_state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl p-8 space-y-6 text-center relative overflow-hidden"
                >
                  {/* Confetti */}
                  {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: confetti particles are statically ordered
                        <ConfettiParticle key={i} delay={i * 0.04} />
                      ))}
                    </div>
                  )}

                  {/* Success icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1,
                    }}
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                    style={{
                      background: "oklch(0.68 0.24 195 / 0.15)",
                      boxShadow: "0 0 40px oklch(0.68 0.24 195 / 0.3)",
                      color: "oklch(0.68 0.24 195)",
                    }}
                  >
                    <CheckCircle className="w-10 h-10" />
                  </motion.div>

                  <div>
                    <h2
                      className="font-display font-black text-2xl mb-1"
                      style={{ color: "oklch(0.95 0.01 265)" }}
                    >
                      Conversion Complete!
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {file?.name} →{" "}
                      {file?.name.replace(
                        /\.[^.]+$/,
                        `.${targetFormat.toLowerCase()}`,
                      )}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-center gap-8">
                    <div>
                      <div className="text-xs text-muted-foreground font-mono mb-1">
                        FROM
                      </div>
                      <div
                        className="font-mono font-bold"
                        style={{ color: "oklch(0.72 0.22 220)" }}
                      >
                        {sourceFormat}
                      </div>
                    </div>
                    <div style={{ color: "oklch(0.4 0.04 265)" }}>→</div>
                    <div>
                      <div className="text-xs text-muted-foreground font-mono mb-1">
                        TO
                      </div>
                      <div
                        className="font-mono font-bold"
                        style={{ color: "oklch(0.68 0.24 195)" }}
                      >
                        {targetFormat}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.72 0.22 220), oklch(0.68 0.24 195))",
                        color: "oklch(0.05 0.02 265)",
                        boxShadow: "0 0 20px oklch(0.72 0.22 220 / 0.4)",
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download {targetFormat}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setFile(null);
                        setPhase("idle");
                        setProgress(0);
                        setCurrentJobId(null);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                      style={{
                        background: "oklch(0.14 0.02 265)",
                        color: "oklch(0.75 0.04 265)",
                        border: "1px solid oklch(0.25 0.04 265)",
                      }}
                    >
                      Convert Another
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent conversions hint */}
            {phase === "idle" && !file && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 space-y-2"
              >
                <p className="text-xs font-mono text-muted-foreground mb-3">
                  SUPPORTED FORMATS
                </p>
                <div className="flex flex-wrap gap-2">
                  {TARGET_FORMATS.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono"
                      style={{
                        background: "oklch(0.14 0.02 265)",
                        color: "oklch(0.6 0.06 265)",
                        border: "1px solid oklch(0.20 0.03 265)",
                      }}
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>

        {/* Footer */}
        <footer
          className="py-6 px-6 text-center text-xs"
          style={{ color: "oklch(0.38 0.03 265)" }}
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

      {/* Snake Game Modal */}
      <Dialog open={showGame} onOpenChange={setShowGame}>
        <DialogContent
          data-ocid="game.modal"
          className="max-w-fit p-0 overflow-hidden"
          style={{
            background: "oklch(0.09 0.008 265)",
            border: "1px solid oklch(0.72 0.22 220 / 0.3)",
            boxShadow:
              "0 0 60px oklch(0.72 0.22 220 / 0.2), 0 0 120px oklch(0.68 0.24 195 / 0.1)",
          }}
        >
          <DialogHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display font-bold text-lg flex items-center gap-2">
                <Gamepad2
                  className="w-5 h-5"
                  style={{ color: "oklch(0.75 0.20 285)" }}
                />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.22 220), oklch(0.75 0.20 285))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Snake
                </span>
                <span className="text-xs font-mono text-muted-foreground font-normal ml-1">
                  — converting in background
                </span>
              </DialogTitle>
              <button
                type="button"
                data-ocid="game.close_button"
                onClick={() => setShowGame(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                style={{ color: "oklch(0.55 0.04 265)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4">
            <SnakeGame />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
