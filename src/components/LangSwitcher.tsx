import { useLang } from "../lib/i18n";

export function LangSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center bg-muted/40 border border-border rounded-lg overflow-hidden h-8 shrink-0">
      <button
        onClick={() => setLang("en")}
        className={`px-3 h-full text-xs font-semibold transition-all ${
          lang === "en"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <div className="w-px h-4 bg-border" />
      <button
        onClick={() => setLang("ar")}
        className={`px-3 h-full text-xs font-semibold transition-all ${
          lang === "ar"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        AR
      </button>
    </div>
  );
}
