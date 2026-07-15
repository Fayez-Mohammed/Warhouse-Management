import { useState } from "react";
import type React from "react";
import { Eye, EyeOff, Warehouse, ArrowRight, Loader2, AlertCircle, Package } from "lucide-react";
import { API, saveTokens } from "../../lib/api";
import { ThemeToggle } from "../../components/ThemeToggle";
import type { UserInfo } from "../../types";

export function LoginPage({ onSuccess, onOtpRequired, dark, toggleTheme }: {
  onSuccess: (u: UserInfo) => void;
  onOtpRequired: (email: string) => void;
  dark: boolean;
  toggleTheme: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, string> = { password };
      if (email.trim()) body.email = email.trim();

      const res = await fetch(`${API}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: Record<string, unknown>;
      try { data = await res.json(); }
      catch { setError(`Server error (HTTP ${res.status})`); return; }

      if (!data.success) { setError((data.message as string) || "Invalid credentials."); return; }

      const verification = data.verification as { requiresotpverification?: boolean; email?: string } | null;
      if (verification?.requiresotpverification) {
        onOtpRequired(verification.email || email);
        return;
      }

      const auth = data.auth as { token: string; refreshtoken: string; tokenexpiry: string } | null;
      const user = data.user as UserInfo | null;
      if (auth?.token && user) {
        saveTokens(auth.token, auth.refreshtoken, auth.tokenexpiry);
        onSuccess(user);
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      setError(err instanceof Error ? `Connection error: ${err.message}` : "Unable to connect. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/8 blur-[80px] pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><Warehouse className="w-5 h-5 text-white" /></div>
            <span className="text-foreground font-semibold tracking-wide text-lg">WarehouseOS</span>
          </div>
          <ThemeToggle dark={dark} toggle={toggleTheme} />
        </div>
        <div className="relative flex-1 flex flex-col items-center justify-center gap-10">
          <div className="relative">
            <div className="w-56 h-56 rounded-3xl bg-card border border-border flex items-center justify-center shadow-2xl">
              <Package className="w-24 h-24 text-primary/40" strokeWidth={1} />
            </div>
            <div className="absolute -top-5 -right-10 bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
              <p className="text-xs text-muted-foreground font-mono">STOCK LEVEL</p>
              <p className="text-2xl font-semibold text-foreground mt-0.5">12,480</p>
              <p className="text-xs text-emerald-400 mt-0.5">+3.2% this week</p>
            </div>
            <div className="absolute -bottom-5 -left-10 bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
              <p className="text-xs text-muted-foreground font-mono">SHIPMENTS</p>
              <p className="text-2xl font-semibold text-foreground mt-0.5">847</p>
              <p className="text-xs text-sky-400 mt-0.5">Today</p>
            </div>
          </div>
          <div className="text-center space-y-3 max-w-xs">
            <h2 className="text-2xl font-semibold text-foreground leading-snug">Full visibility over your inventory</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Track stock levels, manage shipments, and monitor warehouse operations from a single dashboard.</p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">SYSTEM OPERATIONAL</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative">
        <div className="absolute inset-0 bg-card/30 hidden lg:block" />
        <div className="absolute inset-y-0 left-0 w-px bg-border hidden lg:block" />
        <div className="relative w-full max-w-sm space-y-8">
          <div className="flex items-center gap-3 lg:hidden mb-10">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Warehouse className="w-4 h-4 text-white" /></div>
            <span className="text-foreground font-semibold">WarehouseOS</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
            <p className="text-muted-foreground text-sm">Access your inventory dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Email <span className="text-muted-foreground font-normal text-xs">(optional)</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3.5 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading || !password} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-xs text-muted-foreground text-center">Secured with JWT authentication</p>
        </div>
      </div>
    </div>
  );
}
