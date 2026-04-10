<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/auth";
  import { onMount } from "svelte";
  import "../style.css";

  let email = $state("");
  let displayName = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let loading = $state(false);
  let error = $state("");
  let success = $state(false);
  let showPassword = $state(false);
  let showConfirm = $state(false);
  let touched = $state({
    email: false,
    displayName: false,
    password: false,
    confirmPassword: false,
  });

  const emailValid = $derived(
    email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  );
  const displayNameValid = $derived(displayName.trim().length >= 3);
  const passwordValid = $derived(password.length >= 6);
  const confirmValid = $derived(
    confirmPassword.length > 0 && confirmPassword === password,
  );
  const canSubmit = $derived(
    emailValid && displayNameValid && passwordValid && confirmValid && !loading,
  );

  onMount(() => {
    auth.redirectIfLoggedIn(); // Auto redirect ke / jika sudah login
  });

  async function handleRegister(e: Event) {
    e.preventDefault();
    touched = {
      email: true,
      displayName: true,
      password: true,
      confirmPassword: true,
    };
    if (!canSubmit) return;

    loading = true;
    error = "";

    try {
      const res = await fetch("/api/v1/users/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName: displayName.trim(),
          password,
          loginProvider: "email",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        error = json?.data?.message ?? "Pendaftaran gagal. Silakan coba lagi.";
        return;
      }

      const res2 = await fetch("/api/v1/users/self", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + json.data.jwtToken,
        },
      });

      const json2 = await res2.json();

      auth.setAuth(json.data.jwtToken, json2.data);
      await goto("/");

      success = true;
      //   setTimeout(() => goto("/masuk"), 2000);
    } catch {
      error = "Gagal menghubungi server. Periksa koneksi kamu.";
    } finally {
      loading = false;
    }
  }

  const passwordScore = $derived(
    password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^a-zA-Z0-9]/.test(password)
      ? 4
      : password.length >= 10 &&
          (/[A-Z]/.test(password) || /[0-9]/.test(password))
        ? 3
        : password.length >= 8
          ? 2
          : 1,
  );

  const passwordStrengthLabel = $derived(
    passwordScore === 4
      ? "Sangat kuat"
      : passwordScore === 3
        ? "Kuat"
        : passwordScore === 2
          ? "Sedang"
          : "Lemah",
  );

  const barColor = $derived(
    passwordScore === 4
      ? "bg-[var(--color-primary)]"
      : passwordScore === 3
        ? "bg-green-500"
        : passwordScore === 2
          ? "bg-orange-400"
          : "bg-red-500",
  );

  const labelColor = $derived(
    passwordScore === 4
      ? "text-[var(--color-primary)]"
      : passwordScore === 3
        ? "text-green-400"
        : passwordScore === 2
          ? "text-orange-400"
          : "text-red-400",
  );
</script>

<svelte:head>
  <title>Daftar â€” WTPANJAY</title>
</svelte:head>

<div class="auth-root">
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
          fill="var(--color-primary)">W</text
        >
      </svg>
      <span class="logo-text">WTPANJAY</span>
    </a>

    <!-- Card -->
    <div class="auth-card">
      {#if success}
        <!-- Success State -->
        <div class="success-state">
          <div class="success-icon-wrap">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="2.5"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 class="success-title">Akun berhasil dibuat!</h2>
          <p class="success-msg">Kamu akan dialihkan ke halaman masuk...</p>
        </div>
      {:else}
        <div class="card-header">
          <h1 class="card-title">Buat akun baru</h1>
          <p class="card-subtitle">Daftar gratis dan mulai top-up sekarang</p>
        </div>

        <form class="auth-form" onsubmit={handleRegister} novalidate>
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

          <!-- Display Name -->
          <div class="field-group">
            <label class="field-label" for="displayName">Nama Tampilan</label>
            <div
              class="input-wrapper"
              class:input-error={touched.displayName && !displayNameValid}
              class:input-valid={touched.displayName && displayNameValid}
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="displayName"
                type="text"
                class="field-input"
                bind:value={displayName}
                onblur={() => (touched.displayName = true)}
                placeholder="Nama kamu"
                autocomplete="name"
                required
                aria-invalid={touched.displayName && !displayNameValid}
                aria-describedby={touched.displayName && !displayNameValid
                  ? "name-error"
                  : undefined}
              />
            </div>
            {#if touched.displayName && !displayNameValid}
              <span id="name-error" class="field-error"
                >Nama minimal 3 karakter.</span
              >
            {/if}
          </div>

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
            <label class="field-label" for="password">Password</label>
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
                autocomplete="new-password"
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

          <!-- Confirm Password -->
          <div class="field-group">
            <label class="field-label" for="confirmPassword"
              >Konfirmasi Password</label
            >
            <div
              class="input-wrapper"
              class:input-error={touched.confirmPassword && !confirmValid}
              class:input-valid={touched.confirmPassword && confirmValid}
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                class="field-input"
                bind:value={confirmPassword}
                onblur={() => (touched.confirmPassword = true)}
                placeholder="Ulangi password"
                autocomplete="new-password"
                required
                aria-invalid={touched.confirmPassword && !confirmValid}
                aria-describedby={touched.confirmPassword && !confirmValid
                  ? "confirm-error"
                  : undefined}
              />
              <button
                type="button"
                class="toggle-password"
                onclick={() => (showConfirm = !showConfirm)}
                aria-label={showConfirm
                  ? "Sembunyikan password"
                  : "Tampilkan password"}
              >
                {#if showConfirm}
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
            {#if touched.confirmPassword && !confirmValid}
              <span id="confirm-error" class="field-error">
                {confirmPassword.length === 0
                  ? "Konfirmasi password wajib diisi."
                  : "Password tidak cocok."}
              </span>
            {/if}
          </div>

          {#if password.length > 0}
            <div class="flex items-center gap-3 mt-0.5">
              <!-- Bars -->
              <div class="flex flex-1 gap-1">
                {#each [1, 2, 3, 4] as n}
                  <div
                    class="h-1 flex-1 rounded-full transition-all duration-300 ease-out
            {n <= passwordScore ? barColor : 'bg-white/10'}"
                  ></div>
                {/each}
              </div>

              <!-- Label -->
              <span
                class="text-[11px] font-semibold min-w-[5rem] text-right
      transition-colors duration-300 {labelColor}"
              >
                {passwordStrengthLabel}
              </span>
            </div>
          {/if}

          <!-- Submit -->
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
              <span>Mendaftar...</span>
            {:else}
              <span>Buat Akun</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" /><polyline
                  points="12 5 19 12 12 19"
                />
              </svg>
            {/if}
          </button>

          <div class="divider" aria-hidden="true"><span>atau</span></div>

          <p class="register-prompt">
            Sudah punya akun?
            <a href="/auth/login" class="register-link">Masuk sekarang</a>
          </p>
        </form>
      {/if}
    </div>

    <p class="auth-footer">
      Dengan mendaftar, kamu menyetujui
      <a href="/terms" class="footer-link">Syarat &amp; Ketentuan</a>
      dan
      <a href="/privacy" class="footer-link">Kebijakan Privasi</a>
      kami.
    </p>
  </main>
</div>
