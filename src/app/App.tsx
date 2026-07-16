import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { useTheme } from "../hooks/useTheme";
import { LoginPage } from "../pages/auth/LoginPage";
import { OtpPage } from "../pages/auth/OtpPage";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { API, authHeaders, clearTokens } from "../lib/api";
import { LangProvider } from "../lib/i18n";
import type { UserInfo, AppPhase } from "../types";

function AppInner() {
  const [phase, setPhase] = useState<AppPhase>("login");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [otpEmail, setOtpEmail] = useState("");
  const { dark, toggle } = useTheme();

  const performLogout = useCallback(async (expired = false) => {
    // Fire-and-forget server logout (revokes all refresh tokens)
    try {
      await fetch(`${API}/api/Auth/logout`, {
        method: "POST",
        headers: authHeaders(),
      });
    } catch {
      /* ignore network errors on logout */
    }

    clearTokens();
    setUser(null);
    setPhase("login");

    if (expired) {
      toast.error(
        "Your session has expired. Please log in again.",
      );
    }
  }, []);

  // Listen for session-expired events fired by apiFetch when refresh fails
  useEffect(() => {
    function handleExpired() {
      performLogout(true);
    }
    window.addEventListener(
      "auth:sessionExpired",
      handleExpired,
    );
    return () =>
      window.removeEventListener(
        "auth:sessionExpired",
        handleExpired,
      );
  }, [performLogout]);

  function handleLoginSuccess(u: UserInfo) {
    setUser(u);
    setPhase("dashboard");
  }
  function handleOtpRequired(email: string) {
    setOtpEmail(email);
    setPhase("otp");
  }

  return (
    <>
      {phase === "login" && (
        <LoginPage
          onSuccess={handleLoginSuccess}
          onOtpRequired={handleOtpRequired}
          dark={dark}
          toggleTheme={toggle}
        />
      )}
      {phase === "otp" && (
        <OtpPage
          email={otpEmail}
          onSuccess={handleLoginSuccess}
          onBack={() => setPhase("login")}
          dark={dark}
          toggleTheme={toggle}
        />
      )}
      {phase === "dashboard" && (
        <Dashboard
          user={user!}
          onLogout={() => performLogout(false)}
          dark={dark}
          toggleTheme={toggle}
        />
      )}
      <Toaster theme={dark ? "dark" : "light"} />
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}