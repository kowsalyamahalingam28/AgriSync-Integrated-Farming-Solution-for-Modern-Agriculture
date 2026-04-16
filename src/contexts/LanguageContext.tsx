import React, { createContext, useContext, useState } from "react";

type Lang = "en" | "ta";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (en: string, ta: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  toggleLang: () => {},
  t: (en) => en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ta" : "en"));
  const t = (en: string, ta: string) => (lang === "en" ? en : ta);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
