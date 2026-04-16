import { motion } from "framer-motion";
import { MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSpeechLang, type ChatLang } from "./types";

interface Props {
  interimText: string;
  chatLang: ChatLang;
  onStop: () => void;
}

export default function VoiceRecordingPanel({ interimText, chatLang, onStop }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-20 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-8"
    >
      {/* Waveform */}
      <div className="flex items-end gap-1.5 h-16">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 rounded-full bg-primary"
            animate={{
              height: [8, 20 + Math.random() * 40, 8],
            }}
            transition={{
              duration: 0.6 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.08,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Language badge */}
      <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
        🎙️ {getSpeechLang(chatLang)}
      </span>

      {/* Interim text */}
      <div className="min-h-[3rem] text-center max-w-md">
        {interimText ? (
          <motion.p
            key={interimText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-foreground font-medium"
          >
            {interimText}
          </motion.p>
        ) : (
          <p className="text-muted-foreground text-sm animate-pulse">Listening...</p>
        )}
      </div>

      <Button onClick={onStop} variant="destructive" size="lg" className="rounded-full gap-2">
        <MicOff className="h-5 w-5" />
        Stop
      </Button>
    </motion.div>
  );
}
