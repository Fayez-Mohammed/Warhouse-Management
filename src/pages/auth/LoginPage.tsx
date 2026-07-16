import { useState } from "react";
import type React from "react";
import {
  Eye,
  EyeOff,
  Warehouse,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Package,
  ShoppingCart,
} from "lucide-react";
import { API, saveTokens } from "../../lib/api";
import { ThemeToggle } from "../../components/ThemeToggle";
import type { UserInfo } from "../../types";

function StatPill({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl px-5 py-4 shadow-lg">
      <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-muted-foreground uppercase mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-800 dark:text-foreground leading-none">
        {value}
      </p>
      <p className={`text-xs font-medium mt-1.5 ${color}`}>{sub}</p>
    </div>
  );
}

export function LoginPage({
  onSuccess,
  onOtpRequired,
  dark,
  toggleTheme,
}: {
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
      try {
        data = await res.json();
      } catch {
        setError(`Server error (HTTP ${res.status})`);
        return;
      }

      if (!data.success) {
        setError((data.message as string) || "Invalid credentials.");
        return;
      }

      const verification = data.verification as {
        requiresotpverification?: boolean;
        email?: string;
      } | null;
      if (verification?.requiresotpverification) {
        onOtpRequired(verification.email || email);
        return;
      }

      const auth = data.auth as {
        token: string;
        refreshtoken: string;
        tokenexpiry: string;
      } | null;
      const user = data.user as UserInfo | null;
      if (auth?.token && user) {
        saveTokens(auth.token, auth.refreshtoken, auth.tokenexpiry);
        onSuccess(user);
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Connection error: ${err.message}`
          : "Unable to connect. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-background flex"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* dot-grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* glow blobs */}
        <div className="absolute top-1/4 left-1/3 w-[420px] h-[420px] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-sky-400/15 blur-[90px] pointer-events-none" />
        <div className="absolute top-3/4 left-1/4 w-48 h-48 rounded-full bg-indigo-500/15 blur-[70px] pointer-events-none" />

        {/* Logo row */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold tracking-wide text-lg">
              WarehouseOS
            </span>
          </div>
          <ThemeToggle dark={dark} toggle={toggleTheme} />
        </div>

        {/* Center content */}
        <div className="relative flex-1 flex flex-col items-center justify-center gap-12">
          {/* Main card */}
          <div className="relative">
            <div className="w-60 h-60 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <div className="text-center space-y-2">
                <Package
                  className="w-20 h-20 text-blue-400 mx-auto"
                  strokeWidth={1.2}
                />
                <p className="text-xs font-mono text-white/40 tracking-widest">
                  INVENTORY
                </p>
              </div>
            </div>

            {/* Floating stat pills */}
            <div className="absolute -top-6 -right-14">
              <StatPill
                label="Stock level"
                value="12,480"
                sub="+3.2% this week"
                color="text-emerald-400"
              />
            </div>
            <div className="absolute -bottom-6 -left-14">
              <StatPill
                label="Shipments"
                value="847"
                sub="Today"
                color="text-sky-400"
              />
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {[
              {
                icon: TrendingUp,
                label: "Sales",
                val: "$284K",
                c: "text-emerald-400",
              },
              {
                icon: Package,
                label: "Products",
                val: "1,240",
                c: "text-blue-400",
              },
              {
                icon: ShoppingCart,
                label: "Orders",
                val: "92",
                c: "text-sky-400",
              },
            ].map(({ icon: Icon, label, val, c }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/8 rounded-xl p-3 text-center backdrop-blur-sm"
              >
                <Icon className={`w-4 h-4 mx-auto mb-1.5 ${c}`} />
                <p className="text-xs text-white/40 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-white">{val}</p>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div className="text-center space-y-2 max-w-xs">
            <h2 className="text-xl font-semibold text-white leading-snug">
              Full visibility over your inventory
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Track stock, manage shipments, and monitor warehouse operations
              from one place.
            </p>
          </div>
        </div>

        {/* Footer pulse */}
        <div className="relative flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/40 font-mono tracking-widest">
            SYSTEM OPERATIONAL
          </span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative bg-background">
        {/* Subtle top-right accent (light mode) */}
        <div className="absolute top-0 end-0 w-80 h-80 rounded-full bg-blue-500/6 blur-[80px] pointer-events-none dark:opacity-0" />
        <div className="absolute bottom-0 start-0 w-60 h-60 rounded-full bg-sky-400/6 blur-[60px] pointer-events-none dark:opacity-0" />

        <div className="relative w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden mb-10">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Warehouse className="w-4 h-4 text-white" />
            </div>
            <span className="text-foreground font-semibold">WarehouseOS</span>
            <div className="ms-auto">
              <ThemeToggle dark={dark} toggle={toggleTheme} />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">
                Secure access
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Access your inventory dashboard
            </p>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                Email{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 pe-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-3.5 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !password}
              className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all text-sm shadow-md shadow-primary/25"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-5 flex items-center justify-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
            Secured with JWT authentication
          </p>
        </div>
      </div>
    </div>
  );
}
