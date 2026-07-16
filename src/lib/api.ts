//export const API = "https://warhouse-management.runasp.net";
export const API = "http://localhost:5002";

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "*/*",
  };
}

// ─── Token storage helpers ────────────────────────────────────────────────────

export function saveTokens(token: string, refreshToken: string, expiry: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("tokenExpiry", expiry);
}

export function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenExpiry");
}

function isTokenExpiringSoon(): boolean {
  const expiry = localStorage.getItem("tokenExpiry");
  if (!expiry) return false;
  // Refresh if within 90 seconds of expiry
  return new Date(expiry).getTime() - Date.now() < 90_000;
}

// ─── Refresh logic (singleton promise to prevent race conditions) ─────────────

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API}/api/Auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshtoken: refreshToken, useragent: "", ip: "" }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.statusCode === 200 && data.auth?.token) {
      saveTokens(data.auth.token, data.auth.refreshtoken, data.auth.tokenexpiry);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// ─── apiFetch — drop-in fetch replacement with auto token refresh ─────────────
//
// Proactively refreshes before requests when the token is near expiry.
// Falls back to a single retry on 401. Fires "auth:sessionExpired" if
// refresh fails so App.tsx can force logout.

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Proactive refresh if token is about to expire
  if (isTokenExpiringSoon()) {
    const ok = await refreshOnce();
    if (!ok) {
      window.dispatchEvent(new Event("auth:sessionExpired"));
      return new Response(null, { status: 401 });
    }
  }

  const merged: RequestInit = {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  };

  const res = await fetch(url, merged);

  // On 401, try one token refresh then retry
  if (res.status === 401) {
    const ok = await refreshOnce();
    if (!ok) {
      window.dispatchEvent(new Event("auth:sessionExpired"));
      return res;
    }
    return fetch(url, { ...merged, headers: { ...authHeaders(), ...(options.headers ?? {}) } });
  }

  return res;
}
