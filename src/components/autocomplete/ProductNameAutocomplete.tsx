import { useState, useRef, useEffect } from "react";
import { API, authHeaders, apiFetch } from "../../lib/api";
import type { ProductAutocomplete } from "../../types";

export function ProductNameAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [suggestions, setSuggestions] = useState<ProductAutocomplete[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    if (!value.trim()) { setSuggestions([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`${API}/api/Inventory/autocomplete?term=${encodeURIComponent(value)}`, { headers: authHeaders() });
        const data = await res.json();
        setSuggestions(data.value ?? []);
        setOpen(true);
      } catch { /* silent */ }
    }, 260);
  }, [value]);

  useEffect(() => {
    function h(e: MouseEvent) { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <input value={value} onChange={e => { onChange(e.target.value); setOpen(true); }} onFocus={() => suggestions.length > 0 && setOpen(true)} required placeholder="Product name…" className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
          {suggestions.map(s => (
            <button key={s.productid} type="button" onClick={() => { onChange(s.name); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors">
              <span className="font-mono text-xs text-muted-foreground w-6">#{s.code}</span>
              <span className="text-foreground">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
