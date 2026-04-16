export type ChatLang = "ta" | "en" | "hi" | "te" | "auto";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  lang?: ChatLang;
}

export const LANG_OPTIONS: { code: ChatLang; label: string; speechCode: string }[] = [
  { code: "ta", label: "தமிழ்", speechCode: "ta-IN" },
  { code: "en", label: "English", speechCode: "en-US" },
  { code: "hi", label: "हिंदी", speechCode: "hi-IN" },
  { code: "te", label: "తెలుగు", speechCode: "te-IN" },
  { code: "auto", label: "🌐 Auto", speechCode: "en-US" },
];

export function detectLanguage(text: string): ChatLang {
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  return "en";
}

export function getSpeechLang(lang: ChatLang, text?: string): string {
  if (lang === "auto" && text) {
    const detected = detectLanguage(text);
    return LANG_OPTIONS.find((l) => l.code === detected)?.speechCode || "en-US";
  }
  return LANG_OPTIONS.find((l) => l.code === lang)?.speechCode || "en-US";
}
