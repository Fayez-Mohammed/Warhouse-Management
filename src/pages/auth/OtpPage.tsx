import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { ThemeToggle } from "../../components/ThemeToggle";
import type { UserInfo } from "../../types";

export function OtpPage({ email, onSuccess: _onSuccess, onBack, dark, toggleTheme }: { email: string; onSuccess: (u: UserInfo) => void; onBack: () => void; dark: boolean; toggleTheme: () => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  function handleChange(i: number, v: string) {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  }
  function handlePaste(e: React.ClipboardEvent) {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setOtp(p.split("")); refs.current[5]?.focus(); }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="absolute top-4 right-4"><ThemeToggle dark={dark} toggle={toggleTheme} /></div>
      <div className="w-full max-w-sm space-y-8">
        <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-accent" /></div>
        <div><h1 className="text-2xl font-semibold text-foreground">Verify your identity</h1><p className="text-muted-foreground text-sm mt-1">We sent a code to <span className="text-foreground font-medium">{email}</span></p></div>
        <div className="flex gap-2.5 justify-between" onPaste={handlePaste}>
          {otp.map((d, i) => (
            <input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} className="w-12 h-14 text-center text-xl font-semibold bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-mono caret-primary" />
          ))}
        </div>
        {error && <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3.5 py-3"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span></div>}
        <button disabled={otp.some(d => !d) || loading} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify code"}
        </button>
        <button onClick={onBack} className="w-full text-muted-foreground hover:text-foreground text-sm transition-colors py-1">Back to sign in</button>
      </div>
    </div>
  );
}
