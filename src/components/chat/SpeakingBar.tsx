import { motion } from "framer-motion";
import { Square } from "lucide-react";

interface Props {
  onStop: () => void;
}

export default function SpeakingBar({ onStop }: Props) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="flex items-center justify-center gap-3 py-2 px-4 bg-[hsl(var(--gold,42_80%_50%))] rounded-full mx-auto"
      style={{ background: "linear-gradient(90deg, hsl(42 80% 50%), hsl(42 80% 60%))" }}
    >
      {/* Mini waveform */}
      <div className="flex items-end gap-0.5 h-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-primary-foreground"
            animate={{ height: [3, 12, 3] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-primary-foreground">Speaking...</span>
      <button onClick={onStop} className="w-5 h-5 bg-primary-foreground/30 rounded flex items-center justify-center hover:bg-primary-foreground/50 transition-colors">
        <Square className="h-3 w-3 text-primary-foreground" />
      </button>
    </motion.div>
  );
}
