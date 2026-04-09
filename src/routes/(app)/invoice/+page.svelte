<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let invId = $state("");
  let error = $state("");
  let shake = $state(false);
  let focused = $state(false);
  let loading = $state(false);

  function triggerShake() {
    shake = true;
    setTimeout(() => (shake = false), 500);
  }

  // â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  type ToastType = "error" | "info";
  let toast = $state<{ message: string; type: ToastType } | null>(null);
  let toastTimer: ReturnType<typeof setTimeout>;

  function showToast(message: string, type: ToastType = "error") {
    clearTimeout(toastTimer);
    toast = { message, type };
    toastTimer = setTimeout(() => (toast = null), 5000);
  }

  const errorMessages: Record<string, string> = {
    "404": "Invoice tidak ditemukan. Periksa kembali nomor invoice kamu.",
    not_found: "Invoice tidak ditemukan. Periksa kembali nomor invoice kamu.",
    "500": "Server sedang bermasalah. Coba lagi beberapa saat.",
    "403": "Kamu tidak punya akses ke invoice ini.",
  };

  onMount(() => {
    const errParam = $page.url.searchParams.get("error");
    if (errParam) {
      const msg =
        errorMessages[errParam] ??
        `Terjadi kesalahan (${errParam}). Coba lagi.`;
      showToast(msg, "error");
      const clean = new URL($page.url);
      clean.searchParams.delete("error");
      history.replaceState({}, "", clean.toString());
    }
  });

  // â”€â”€ Submit: cek API dulu, baru navigate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleSubmit(e: Event) {
    e.preventDefault();
    const trimmed = invId.trim().toUpperCase();

    if (!trimmed) {
      error = "Nomor invoice tidak boleh kosong";
      triggerShake();
      return;
    }

    error = "";
    loading = true;

    try {
      const res = await fetch("/api/v1/transactions/c/" + trimmed);

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const msg =
          json?.data?.message ??
          errorMessages[String(res.status)] ??
          `Invoice tidak ditemukan (${res.status})`;
        showToast(msg, "error");
        triggerShake();
        return;
      }

      await goto(`/invoice/${trimmed}`);
    } catch {
      showToast("Gagal terhubung ke server. Periksa koneksi kamu.", "error");
      triggerShake();
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Cek Nomor Invoice</title>
</svelte:head>

<div class="root">
  <div class="bg-glow"></div>
  <div class="bg-grid"></div>

  <!-- â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
  {#if toast}
    <div
      class="toast {toast.type === 'error' ? 'toast-error' : 'toast-info'}"
      role="alert"
      aria-live="assertive"
    >
      {#if toast.type === "error"}
        <svg
          class="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      {:else}
        <svg
          class="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      {/if}
      <span class="toast-msg">{toast.message}</span>
      <button
        class="toast-close"
        onclick={() => (toast = null)}
        aria-label="Tutup"
      >
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="13"
          height="13"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  {/if}

  <main class="center">
    <!-- Eyebrow -->
    <div class="eyebrow">
      <span class="eyebrow-dot"></span>
      <span>WTPANJAY Â· CEK PESANAN</span>
    </div>

    <!-- Headline -->
    <h1 class="headline">
      Cek Invoice<br />
      <span class="headline-accent">Kamu</span>
    </h1>

    <p class="subtitle">
      Masukkan nomor invoice untuk melihat<br class="br-desktop" />
      detail & status pesanan kamu secara langsung.
    </p>

    <!-- Card / Form -->
    <form
      class="card {shake ? 'shake' : ''}"
      onsubmit={handleSubmit}
      novalidate
    >
      {#if focused || invId}
        <div class="card-glow"></div>
      {/if}

      <p class="card-label">Nomor Invoice</p>

      <!-- Input -->
      <div
        class="input-wrap
        {focused ? 'focused' : ''}
        {error ? 'has-error' : ''}
        {invId ? 'has-value' : ''}
        {loading ? 'is-loading' : ''}"
      >
        <svg
          class="input-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          bind:value={invId}
          onfocus={() => {
            focused = true;
            error = "";
          }}
          onblur={() => (focused = false)}
          placeholder="Contoh: M-MNLW5DQ6SUP"
          autocomplete="off"
          spellcheck="false"
          disabled={loading}
          class="input-field"
          aria-label="Nomor Invoice"
        />

        {#if loading}
          <!-- Spinner saat loading -->
          <svg class="spinner" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="rgba(245,197,24,0.2)"
              stroke-width="2.5"
            />
            <path
              d="M12 3a9 9 0 019 9"
              stroke="var(--color-primary)"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        {:else if invId}
          <button
            type="button"
            class="clear-btn"
            onclick={() => {
              invId = "";
              error = "";
            }}
            aria-label="Hapus"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="14"
              height="14"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        {/if}
      </div>

      {#if error}
        <p class="error-msg">
          <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          {error}
        </p>
      {/if}

      <!-- Submit button -->
      <button
        type="submit"
        disabled={loading || !invId.trim()}
        class="submit-btn {invId.trim() && !loading ? 'active' : ''} {loading
          ? 'btn-loading'
          : ''}"
      >
        {#if invId.trim() && !loading}
          <div class="btn-shine"></div>
        {/if}

        {#if loading}
          <!-- Spinner di dalam tombol -->
          <svg class="btn-spinner" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="rgba(0,0,0,0.2)"
              stroke-width="2.5"
            />
            <path
              d="M12 3a9 9 0 019 9"
              stroke="#000"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
          Memeriksa Invoice...
        {:else}
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Cari Invoice
        {/if}
      </button>

      <p class="hint">
        Nomor invoice dikirim ke WhatsApp kamu setelah transaksi dibuat
      </p>
    </form>

    <!-- Trust badges -->
    <div class="badges">
      {#each [{ icon: "âš¡", label: "Instan" }, { icon: "ðŸ”’", label: "Aman" }, { icon: "ðŸ•", label: "24/7" }] as b}
        <div class="badge-item">
          <span class="badge-icon">{b.icon}</span>
          <span class="badge-label">{b.label}</span>
        </div>
      {/each}
    </div>
  </main>
</div>

<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .root {
    min-height: 100svh;
    background: #080808;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
    font-family: "Inter", system-ui, sans-serif;
  }

  .bg-glow {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
        ellipse 55% 35% at 50% 0%,
        rgba(245, 197, 24, 0.09) 0%,
        transparent 70%
      ),
      radial-gradient(
        ellipse 30% 25% at 20% 80%,
        rgba(245, 197, 24, 0.04) 0%,
        transparent 60%
      ),
      radial-gradient(
        ellipse 25% 20% at 85% 70%,
        rgba(245, 197, 24, 0.03) 0%,
        transparent 60%
      );
  }
  .bg-grid {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px
    );
    background-size: 28px 28px;
    mask-image: radial-gradient(
      ellipse 80% 60% at 50% 50%,
      black 0%,
      transparent 100%
    );
  }

  .center {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* â”€â”€ Eyebrow â”€â”€ */
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.625rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: rgba(255, 255, 255, 0.25);
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    padding: 0.375rem 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.02);
  }
  .eyebrow-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-primary);
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }

  /* â”€â”€ Headline â”€â”€ */
  .headline {
    font-size: clamp(2.25rem, 8vw, 3.5rem);
    font-weight: 900;
    line-height: 1.1;
    color: #fff;
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
  }
  .headline-accent {
    color: var(--color-primary);
    position: relative;
    display: inline-block;
  }
  .headline-accent::after {
    content: "";
    position: absolute;
    bottom: 4px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), rgba(245, 197, 24, 0));
    border-radius: 2px;
  }

  .subtitle {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1.7;
    margin-bottom: 2.5rem;
  }
  .br-desktop {
    display: none;
  }
  @media (min-width: 480px) {
    .br-desktop {
      display: block;
    }
  }

  /* â”€â”€ Card â”€â”€ */
  .card {
    position: relative;
    width: 100%;
    background: #111111;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.25rem;
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.5),
      0 24px 64px rgba(0, 0, 0, 0.6);
    transition: border-color 300ms;
    margin-bottom: 1.5rem;
  }
  .card:has(.focused),
  .card:has(.has-value) {
    border-color: rgba(245, 197, 24, 0.2);
  }
  .card-glow {
    position: absolute;
    inset: -1px;
    border-radius: 1.25rem;
    background: radial-gradient(
      ellipse 80% 40% at 50% 0%,
      rgba(245, 197, 24, 0.06),
      transparent 70%
    );
    pointer-events: none;
  }

  .shake {
    animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  }
  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-6px);
    }
    40% {
      transform: translateX(6px);
    }
    60% {
      transform: translateX(-4px);
    }
    80% {
      transform: translateX(4px);
    }
  }

  .card-label {
    font-size: 0.6875rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: left;
  }

  /* â”€â”€ Input â”€â”€ */
  .input-wrap {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.875rem;
    padding: 0 0.875rem;
    transition: all 220ms;
  }
  .input-wrap.focused {
    border-color: rgba(245, 197, 24, 0.45);
    background: rgba(245, 197, 24, 0.03);
    box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.08);
  }
  .input-wrap.has-value:not(.focused) {
    border-color: rgba(245, 197, 24, 0.2);
  }
  .input-wrap.has-error {
    border-color: rgba(248, 113, 113, 0.45);
    background: rgba(248, 113, 113, 0.03);
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.08);
  }
  .input-wrap.is-loading {
    border-color: rgba(245, 197, 24, 0.3);
    background: rgba(245, 197, 24, 0.02);
    opacity: 0.8;
  }

  .input-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.2);
    transition: color 220ms;
  }
  .input-wrap.focused .input-icon,
  .input-wrap.has-value .input-icon {
    color: var(--color-primary);
  }

  .input-field {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.875rem 0;
    font-size: 0.9375rem;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .input-field:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .input-field::placeholder {
    color: rgba(255, 255, 255, 0.18);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
  }

  /* Spinner di dalam input */
  .spinner {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    animation: spin 0.75s linear infinite;
  }

  .clear-btn {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 150ms;
  }
  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .error-msg {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.6875rem;
    color: #fca5a5;
    text-align: left;
  }

  /* â”€â”€ Submit button â”€â”€ */
  .submit-btn {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.9375rem;
    border-radius: 0.875rem;
    border: none;
    font-size: 0.9375rem;
    font-weight: 900;
    letter-spacing: 0.02em;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.18);
    transition: all 220ms;
  }
  .submit-btn.active {
    background: var(--color-primary);
    color: #000;
    cursor: pointer;
    box-shadow:
      0 0 32px rgba(245, 197, 24, 0.4),
      0 4px 16px rgba(245, 197, 24, 0.25);
  }
  .submit-btn.active:hover {
    background: #fcd534;
    box-shadow:
      0 0 40px rgba(245, 197, 24, 0.5),
      0 6px 20px rgba(245, 197, 24, 0.3);
    transform: translateY(-1px);
  }
  .submit-btn.active:active {
    transform: scale(0.98);
  }
  .submit-btn.btn-loading {
    background: var(--color-primary);
    color: #000;
    cursor: wait;
    box-shadow: 0 0 20px rgba(245, 197, 24, 0.25);
    opacity: 0.85;
  }

  /* Spinner di dalam tombol */
  .btn-spinner {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .btn-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 255, 255, 0.45) 50%,
      transparent 60%
    );
    animation: shine 2.5s infinite;
    pointer-events: none;
  }
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    60% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .hint {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.2);
    text-align: center;
    line-height: 1.5;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 0.875rem;
    margin-top: 0.125rem;
  }

  /* â”€â”€ Trust badges â”€â”€ */
  .badges {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  .badge-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .badge-icon {
    font-size: 0.875rem;
  }
  .badge-label {
    font-size: 0.6875rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.2);
  }

  /* â”€â”€ Toast â”€â”€ */
  .toast {
    position: fixed;
    top: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    border: 1px solid;
    backdrop-filter: blur(12px);
    font-size: 0.8125rem;
    font-weight: 600;
    max-width: calc(100vw - 2rem);
    white-space: normal;
    line-height: 1.4;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    animation: toastIn 280ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .toast-error {
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.3);
    color: #fca5a5;
  }
  .toast-info {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.25);
    color: var(--color-primary);
  }
  .toast-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }
  .toast-msg {
    flex: 1;
  }
  .toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: inherit;
    opacity: 0.5;
    cursor: pointer;
    padding: 0.125rem;
    margin-left: 0.25rem;
    transition: opacity 150ms;
  }
  .toast-close:hover {
    opacity: 1;
  }

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-0.75rem);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>

