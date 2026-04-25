"use client";

import { useLanguage } from "@/contexts/language";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "mr", label: "मर" },
];

export function LangPills() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-foreground/10 bg-foreground/[0.03] p-0.5">
      {LANGS.map((entry) => (
        <button
          key={entry.code}
          onClick={() => setLang(entry.code)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
            lang === entry.code
              ? "bg-warm text-warm-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}
