import { motion } from "framer-motion";
import { Leaf, User, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Message, ChatLang } from "./types";

interface Props {
  msg: Message;
  isBotSpeaking: boolean;
  onSpeak: (text: string, lang: ChatLang) => void;
}

export default function MessageBubble({ msg, isBotSpeaking, onSpeak }: Props) {
  const isBot = msg.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className={`w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 relative ${
          isBotSpeaking ? "ring-2 ring-[hsl(42_80%_50%)] animate-pulse" : ""
        }`}>
          <Leaf className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-5 py-3 relative group ${
        isBot
          ? "bg-card border border-border rounded-bl-md"
          : "bg-primary text-primary-foreground rounded-br-md"
      }`}>
        {isBot ? (
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm">{msg.content}</p>
        )}
        {/* Per-message TTS button */}
        {isBot && msg.content && (
          <button
            onClick={() => onSpeak(msg.content, msg.lang || "en")}
            className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
            title="Play aloud"
          >
            <Volume2 className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
      {!isBot && (
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-1">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  );
}
