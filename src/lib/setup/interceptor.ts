// src/lib/setup/fetch-interceptor.ts
import { auth } from "$lib/auth.svelte";

export function setupFetchInterceptor() {
  if (typeof window === "undefined") return;

  // Jangan pasang dua kali
  if ((window as any).__wtp_fetch_patched) return;
  (window as any).__wtp_fetch_patched = true;

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = auth.token;

    const headers = new Headers(init?.headers ?? {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return originalFetch(input, { ...init, headers });
  };
}
