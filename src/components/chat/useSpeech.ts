import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatLang } from "./types";
import { getSpeechLang, detectLanguage } from "./types";

export function useSpeechToText(chatLang: ChatLang) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recRef = useRef<any>(null);

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SR) {
        alert("Speech recognition not supported in this browser.");
        return;
      }
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = chatLang === "auto" ? "en-US" : getSpeechLang(chatLang);

      rec.onresult = (e: any) => {
        let interim = "";
        let final = "";
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript;
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        setInterimText(interim || final);
        if (final) {
          onResult(final);
          setIsListening(false);
          setInterimText("");
        }
      };
      rec.onerror = () => { setIsListening(false); setInterimText(""); };
      rec.onend = () => { setIsListening(false); setInterimText(""); };

      recRef.current = rec;
      rec.start();
      setIsListening(true);
    },
    [chatLang]
  );

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  }, []);

  return { isListening, interimText, startListening, stopListening };
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, lang: ChatLang) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const stripped = text.replace(/[#*_`>\-|]/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    const utter = new SpeechSynthesisUtterance(stripped);
    const speechLang = getSpeechLang(lang, text);
    utter.lang = speechLang;

    // Try to pick a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = speechLang.split("-")[0];
    const match = voices.find((v) => v.lang.startsWith(langPrefix));
    if (match) utter.voice = match;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleTts = useCallback(() => {
    setTtsEnabled((p) => {
      if (p) window.speechSynthesis.cancel();
      return !p;
    });
  }, []);

  // Load voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", () => {});
  }, []);

  return { isSpeaking, ttsEnabled, speak, stopSpeaking, toggleTts };
}
