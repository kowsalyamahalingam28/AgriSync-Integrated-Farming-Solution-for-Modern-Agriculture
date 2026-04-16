import { LANG_OPTIONS, type ChatLang } from "./types";

interface Props {
  selected: ChatLang;
  onChange: (lang: ChatLang) => void;
}

export default function LanguageSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {LANG_OPTIONS.map((opt) => (
        <button
          key={opt.code}
          onClick={() => onChange(opt.code)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            selected === opt.code
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
