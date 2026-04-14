<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/auth";
  import { onMount } from "svelte";
  import "../style.css";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");
  let showPassword = $state(false);
  let touched = $state({ email: false, password: false });

  const { data } = $props();

  const emailValid = $derived(
    email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  );
  const passwordValid = $derived(password.length >= 6);
  const canSubmit = $derived(emailValid && passwordValid && !loading);

  onMount(() => {
    auth.redirectIfLoggedIn(); // Auto redirect ke / jika sudah login
  });

  async function handleLogin(e: Event) {
    e.preventDefault();
    touched = { email: true, password: true };
    if (!canSubmit) return;

    loading = true;
    error = "";

    try {
      const res = await fetch("/credentials/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        error =
          json?.data?.data?.message ??
          json?.data?.message ??
          "Login gagal. Periksa kembali email dan password kamu.";
        return;
      }

      // Kalau endpoint sudah mengembalikan user:
      const token = json.data?.jwtToken;
      const user = json.data?.user;

      if (token && user) {
        // Optional: sync ke auth store (biar UI langsung tau)
        auth.setAuth(token, user);
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      error = "Gagal menghubungi server. Periksa koneksi kamu.";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Masuk - WTPANJAY</title>
</svelte:head>

<div class="auth-root">
  <!-- Glow blobs -->
  <div class="glow glow-1" aria-hidden="true"></div>
  <div class="glow glow-2" aria-hidden="true"></div>

  <main class="auth-wrapper">
    <!-- Logo -->
    <a href="/" class="logo-link" aria-label="Kembali ke beranda">
      <svg class="logo-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <polygon
          points="20,2 38,11 38,29 20,38 2,29 2,11"
          fill="var(--color-primary)"
          opacity="0.15"
        />
        <polygon
          points="20,2 38,11 38,29 20,38 2,29 2,11"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="1.5"
        />
        <text
          x="20"
          y="26"
          text-anchor="middle"
          font-family="'Rajdhani',sans-serif"
          font-weight="700"
          font-size="14"
          fill="var(--color-primary)">TS</text
        >
      </svg>
      <span class="logo-text"
        >{data?.siteConfig?.siteName ?? "Topupin Store"}</span
      >
    </a>

    <!-- Card -->
    <div class="auth-card">
      <div class="card-header">
        <h1 class="card-title">Selamat datang kembali</h1>
        <p class="card-subtitle">Masuk ke akun kamu untuk melanjutkan</p>
      </div>

      <form class="auth-form" onsubmit={handleLogin} novalidate>
        <!-- Error Banner -->
        {#if error}
          <div class="error-banner" role="alert">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" /><line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
              /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        {/if}

        <!-- Email -->
        <div class="field-group">
          <label class="field-label" for="email">Email</label>
          <div
            class="input-wrapper"
            class:input-error={touched.email && !emailValid}
            class:input-valid={touched.email && emailValid}
          >
            <svg
              class="input-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              id="email"
              type="email"
              class="field-input"
              bind:value={email}
              onblur={() => (touched.email = true)}
              placeholder="email@contoh.com"
              autocomplete="email"
              required
              aria-invalid={touched.email && !emailValid}
              aria-describedby={touched.email && !emailValid
                ? "email-error"
                : undefined}
            />
          </div>
          {#if touched.email && !emailValid}
            <span id="email-error" class="field-error"
              >Masukkan email yang valid.</span
            >
          {/if}
        </div>

        <!-- Password -->
        <div class="field-group">
          <div class="label-row">
            <label class="field-label" for="password">Password</label>
            <a href="/lupa-password" class="forgot-link">Lupa password?</a>
          </div>
          <div
            class="input-wrapper"
            class:input-error={touched.password && !passwordValid}
            class:input-valid={touched.password && passwordValid}
          >
            <svg
              class="input-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              class="field-input"
              bind:value={password}
              onblur={() => (touched.password = true)}
              placeholder="Minimal 6 karakter"
              autocomplete="current-password"
              required
              aria-invalid={touched.password && !passwordValid}
              aria-describedby={touched.password && !passwordValid
                ? "password-error"
                : undefined}
            />
            <button
              type="button"
              class="toggle-password"
              onclick={() => (showPassword = !showPassword)}
              aria-label={showPassword
                ? "Sembunyikan password"
                : "Tampilkan password"}
            >
              {#if showPassword}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                  />
                  <path
                    d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              {:else}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              {/if}
            </button>
          </div>
          {#if touched.password && !passwordValid}
            <span id="password-error" class="field-error"
              >Password minimal 6 karakter.</span
            >
          {/if}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-submit"
          disabled={!canSubmit}
          aria-busy={loading}
        >
          {#if loading}
            <svg
              class="spinner"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              aria-hidden="true"
            >
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              />
            </svg>
            <span>Sedang masuk...</span>
          {:else}
            <span>Masuk</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          {/if}
        </button>

        <!-- Divider -->
        <div class="divider" aria-hidden="true"><span>atau</span></div>

        <!-- Register Link -->
        <p class="register-prompt">
          Belum punya akun?
          <a href="/auth/register" class="register-link">Daftar sekarang</a>
        </p>
      </form>
    </div>

    <!-- Footer note -->
    <p class="auth-footer">
      Dengan masuk, kamu menyetujui
      <a href="/terms" class="footer-link">Syarat &amp; Ketentuan</a>
      dan
      <a href="/privacy" class="footer-link">Kebijakan Privasi</a>
      kami.
    </p>
  </main>
</div>
