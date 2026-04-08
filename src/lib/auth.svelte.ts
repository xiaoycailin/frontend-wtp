/**
 * auth.svelte.ts
 * Reactive auth state untuk SvelteKit + Svelte 5
 *
 * Usage:
 *   import { auth } from "$lib/auth.svelte";
 *
 *   auth.token       → string | null
 *   auth.user        → User | null
 *   auth.isLoggedIn  → boolean
 *   auth.isAdmin     → boolean
 *   auth.loading     → boolean
 *
 *   auth.init()           → panggil di +layout.svelte onMount
 *   auth.fetchSelf()      → ambil data terbaru dari API
 *   auth.setAuth(t, u)    → set setelah login berhasil
 *   auth.logout()         → hapus semua data & redirect
 */

import { goto } from "$app/navigation";

// ── Types ──────────────────────────────────────────────────────
export interface User {
  id: string;
  displayName: string;
  email: string;
  role: "admin" | "user" | string;
  iat?: number;
  exp?: number;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  readonly isLoggedIn: boolean;
  readonly isAdmin: boolean;
}

// ── JWT helpers (tanpa external library) ──────────────────────
export function decodeJwt<T = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return true;
  // Tambah buffer 30 detik supaya tidak expired di tengah request
  return Date.now() / 1000 > payload.exp - 30;
}

export function getTokenExpiry(token: string): Date | null {
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return null;
  return new Date(payload.exp * 1000);
}

// ── Reactive state (Svelte 5 runes) ───────────────────────────
let _token = $state<string | null>(null);
let _user = $state<User | null>(null);
let _loading = $state<boolean>(false);
let _initialized = $state<boolean>(false);

// ── Internal helpers ──────────────────────────────────────────
function _clearStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("wtpanjay_token");
  localStorage.removeItem("wtpanjay_user");
}

function _saveStorage(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wtpanjay_token", token);
  localStorage.setItem("wtpanjay_user", JSON.stringify(user));
}

// ── Public API ────────────────────────────────────────────────

/**
 * Inisialisasi auth dari localStorage.
 * Panggil SATU KALI di onMount +layout.svelte.
 */
function init(): void {
  if (typeof window === "undefined" || _initialized) return;

  const token = localStorage.getItem("wtpanjay_token");
  const userStr = localStorage.getItem("wtpanjay_user");

  if (token && !isTokenExpired(token)) {
    _token = token;
    if (userStr) {
      try {
        _user = JSON.parse(userStr) as User;
      } catch {
        /* ignore */
      }
    }
  } else {
    // Token tidak ada atau sudah expired → bersihkan
    _clearStorage();
  }

  _initialized = true;
}

/**
 * Ambil data user terbaru dari API /users/self.
 * Otomatis logout jika 401.
 */
async function fetchSelf(): Promise<User | null> {
  if (!_token) return null;

  _loading = true;
  try {
    const res = await fetch("/api/v1/users/self", {
      headers: { Authorization: `Bearer ${_token}` },
    });

    if (res.status === 401) {
      logout();
      return null;
    }

    if (!res.ok) return null;

    const json = await res.json();
    // Support format: { data: { ...user } } atau { data: { user: {...} } }
    const user: User = json?.data?.user ?? json?.data ?? null;

    if (user) {
      _user = user;
      if (_token) _saveStorage(_token, user);
    }

    return user;
  } catch {
    return null;
  } finally {
    _loading = false;
  }
}

/**
 * Simpan token & user setelah login berhasil.
 * Dipanggil dari handleLogin di +page.svelte.
 */
function setAuth(token: string, user: User): void {
  _token = token;
  _user = user;
  _saveStorage(token, user);
}

/**
 * Logout: hapus semua data dan redirect ke /auth/login.
 */
async function logout(redirectTo = "/auth/login"): Promise<void> {
  try {
    // Hapus cookie di server
    await fetch("/credentials/logout", { method: "POST" });
  } catch (e) {
    console.error("Logout error:", e);
  }

  // Bersihkan state & localStorage client
  _token = null;
  _user = null;
  _clearStorage();
  goto(redirectTo);
}

/**
 * Guard: arahkan ke /auth/login jika belum login.
 * Gunakan di onMount halaman yang butuh auth.
 *
 * @example
 * onMount(() => auth.requireAuth());
 */
function requireAuth(redirectTo = "/auth/login"): boolean {
  if (!_token || isTokenExpired(_token)) {
    _clearStorage();
    goto(redirectTo);
    return false;
  }
  return true;
}

/**
 * Guard: arahkan ke / jika sudah login.
 * Gunakan di onMount halaman login/register.
 *
 * @example
 * onMount(() => auth.redirectIfLoggedIn());
 */
function redirectIfLoggedIn(redirectTo = "/"): boolean {
  if (_token && !isTokenExpired(_token)) {
    goto(redirectTo);
    return true;
  }
  return false;
}

// ── Export ─────────────────────────────────────────────────────
export const auth = {
  // State (reactive getters)
  get token() {
    return _token;
  },
  get user() {
    return _user;
  },
  get loading() {
    return _loading;
  },
  get initialized() {
    return _initialized;
  },
  get isLoggedIn() {
    return !!_token && !isTokenExpired(_token);
  },
  get isAdmin() {
    return _user?.role === "admin";
  },

  // Methods
  init,
  fetchSelf,
  setAuth,
  logout,
  requireAuth,
  redirectIfLoggedIn,

  // JWT utils (re-export untuk kenyamanan)
  decodeJwt,
  isTokenExpired,
  getTokenExpiry,
};
