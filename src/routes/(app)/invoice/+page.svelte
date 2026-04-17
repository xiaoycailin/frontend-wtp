<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let invId = $state("");
  let error = $state("");
  let shake = $state(false);
  let focused = $state(false);
  let loading = $state(false);
  let mounted = $state(false);

  function triggerShake() {
    shake = true;
    setTimeout(() => (shake = false), 500);
  }

  type ToastType = "error" | "info";
  let toast = $state<{ message: string; type: ToastType } | null>(null);
  let toastTimer: ReturnType<typeof setTimeout>;

  function showToast(message: string, type: ToastType = "error") {
    clearTimeout(toastTimer);
    toast = { message, type };
    toastTimer = setTimeout(() => (toast = null), 5000);
  }

  const errorMessages: Record<string, string> = {
    "404": "Invoice tidak ditemukan. Periksa kembali nomornya.",
    not_found: "Invoice tidak ditemukan. Periksa kembali nomornya.",
    "500": "Server sedang bermasalah. Coba beberapa saat lagi.",
    "403": "Kamu tidak punya akses ke invoice ini.",
  };

  onMount(() => {
    setTimeout(() => (mounted = true), 40);
    const errParam = $page.url.searchParams.get("error");
    if (errParam) {
      const msg = errorMessages[errParam] ?? `Terjadi kesalahan (${errParam}).`;
      showToast(msg, "error");
      const clean = new URL($page.url);
      clean.searchParams.delete("error");
      history.replaceState({}, "", clean.toString());
    }
  });

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
      showToast("Gagal terhubung. Periksa koneksi kamu.", "error");
      triggerShake();
    } finally {
      loading = false;
    }
  }

  // Format input otomatis
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    invId = target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, "");
    error = "";
  }
</script>

<svelte:head>
  <title>Cek Invoice — Topupin</title>
</svelte:head>

<!-- Toast -->
{#if toast}
  <div
    role="alert"
    aria-live="assertive"
    class="toast-wrap"
    class:toast-error={toast.type === "error"}
    class:toast-info={toast.type === "info"}
  >
    <div class="toast-inner">
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
      <span class="toast-text">{toast.message}</span>
      <button
        class="toast-close"
        onclick={() => (toast = null)}
        aria-label="Tutup"
      >
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="12"
          height="12"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}

<div class="page" class:mounted>
  <!-- Ambient background layers -->
  <div class="ambient" aria-hidden="true">
    <div class="ambient-top"></div>
    <div class="ambient-left"></div>
    <div class="ambient-right"></div>
  </div>

  <!-- Dot grid -->
  <div class="dot-grid" aria-hidden="true"></div>

  <!-- Main content -->
  <main class="content">
    <!-- Step pill -->
    <div class="step-pill">
      <span class="step-dot"></span>
      <span>CEK TRANSAKSI</span>
    </div>

    <!-- Hero text -->
    <div class="hero-text">
      <h1 class="title">
        Lacak Pesanan<br />
        <span class="title-highlight">Real-time</span>
      </h1>
      <p class="desc">
        Masukkan nomor invoice untuk melihat status & detail pesananmu secara
        langsung.
      </p>
    </div>

    <!-- Search card -->
    <form
      class="search-card"
      class:shake
      class:card-active={focused || !!invId}
      onsubmit={handleSubmit}
      novalidate
    >
      <!-- Card ambient glow when active -->
      <div class="card-glow" class:visible={focused || !!invId}></div>

      <div class="form-body">
        <label class="form-label" for="inv_input">Nomor Invoice</label>

        <!-- Input group -->
        <div
          class="input-group"
          class:ig-focused={focused}
          class:ig-error={!!error}
          class:ig-loading={loading}
          class:ig-filled={!!invId}
        >
          <!-- Left icon -->
          <div class="ig-left">
            {#if loading}
              <svg class="spin-icon" viewBox="0 0 24 24" fill="none">
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
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            {/if}
          </div>

          <input
            id="inv_input"
            type="text"
            value={invId}
            oninput={handleInput}
            onfocus={() => {
              focused = true;
              error = "";
            }}
            onblur={() => (focused = false)}
            placeholder="Contoh: TRX-MNLW5DQ6"
            autocomplete="off"
            spellcheck="false"
            disabled={loading}
            class="ig-input"
            aria-label="Nomor Invoice"
            aria-describedby={error ? "inv-error" : undefined}
          />

          <!-- Clear button -->
          {#if invId && !loading}
            <button
              type="button"
              class="ig-clear"
              onclick={() => {
                invId = "";
                error = "";
              }}
              aria-label="Hapus input"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="12"
                height="12"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          {/if}
        </div>

        {#if error}
          <p id="inv-error" class="field-error" role="alert">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {error}
          </p>
        {/if}

        <!-- CTA Button -->
        <button
          type="submit"
          disabled={loading || !invId.trim()}
          class="cta-btn"
          class:cta-ready={!!invId.trim() && !loading}
          class:cta-loading={loading}
        >
          {#if invId.trim() && !loading}
            <div class="btn-shine"></div>
          {/if}

          {#if loading}
            <svg
              class="spin-icon"
              viewBox="0 0 24 24"
              fill="none"
              width="16"
              height="16"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="rgba(0,0,0,0.25)"
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
      </div>

      <!-- Card footer -->
      <div class="card-footer">
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
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Nomor invoice dikirim ke WhatsApp setelah transaksi berhasil dibuat
      </div>
    </form>

    <!-- Trust badges -->
    <div class="trust-row">
      <div class="trust-item">
        <div class="trust-icon trust-green">
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <span>Aman & Terenkripsi</span>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <div class="trust-icon trust-yellow">
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <span>Hasil Instan</span>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <div class="trust-icon trust-blue">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span>24/7 Aktif</span>
      </div>
    </div>
  </main>
</div>

<style>
  /* ── Reset ── */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── Page shell ── */
  .page {
    min-height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem 3rem;
    position: relative;
    overflow: hidden;
    background: #060606;
    opacity: 0;
    transform: translateY(12px);
    transition:
      opacity 0.4s ease,
      transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .page.mounted {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Ambient ── */
  .ambient {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }
  .ambient-top {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 140%;
    height: 60%;
    background: radial-gradient(
      ellipse,
      rgba(245, 197, 24, 0.07) 0%,
      transparent 65%
    );
  }
  .ambient-left {
    position: absolute;
    bottom: 10%;
    left: -10%;
    width: 50%;
    height: 50%;
    background: radial-gradient(
      ellipse,
      rgba(245, 197, 24, 0.03) 0%,
      transparent 60%
    );
  }
  .ambient-right {
    position: absolute;
    top: 20%;
    right: -5%;
    width: 40%;
    height: 40%;
    background: radial-gradient(
      ellipse,
      rgba(99, 102, 241, 0.04) 0%,
      transparent 60%
    );
  }

  /* ── Dot grid ── */
  .dot-grid {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
    mask-image: radial-gradient(
      ellipse 75% 70% at 50% 40%,
      black 0%,
      transparent 100%
    );
  }

  /* ── Content ── */
  .content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  /* ── Step pill ── */
  .step-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.875rem;
    border-radius: 9999px;
    background: rgba(245, 197, 24, 0.06);
    border: 1px solid rgba(245, 197, 24, 0.15);
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    color: rgba(245, 197, 24, 0.7);
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }
  .step-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-primary, #f5c518);
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%,
    100% {
      opacity: 1;
      box-shadow: 0 0 0 0 rgba(245, 197, 24, 0.4);
    }
    50% {
      opacity: 0.6;
      box-shadow: 0 0 0 4px rgba(245, 197, 24, 0);
    }
  }

  /* ── Hero ── */
  .hero-text {
    text-align: center;
    margin-bottom: 2rem;
  }
  .title {
    font-size: clamp(2rem, 9vw, 3.25rem);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: #fff;
    margin-bottom: 0.875rem;
  }
  .title-highlight {
    position: relative;
    color: var(--color-primary, #f5c518);
    display: inline-block;
  }
  .title-highlight::after {
    content: "";
    position: absolute;
    bottom: 2px;
    left: 0;
    width: 100%;
    height: 2.5px;
    border-radius: 99px;
    background: linear-gradient(
      90deg,
      var(--color-primary, #f5c518) 0%,
      rgba(245, 197, 24, 0) 100%
    );
  }
  .desc {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1.7;
    max-width: 32ch;
    margin: 0 auto;
  }

  /* ── Search card ── */
  .search-card {
    position: relative;
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 1.5rem;
    overflow: hidden;
    margin-bottom: 1.5rem;
    transition:
      border-color 0.25s ease,
      box-shadow 0.25s ease;
  }
  .search-card.card-active {
    border-color: rgba(245, 197, 24, 0.18);
    box-shadow:
      0 0 0 1px rgba(245, 197, 24, 0.06),
      0 20px 60px rgba(0, 0, 0, 0.5),
      0 0 80px rgba(245, 197, 24, 0.04);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(
      to bottom,
      rgba(245, 197, 24, 0.06),
      transparent
    );
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .card-glow.visible {
    opacity: 1;
  }

  .form-body {
    padding: 1.5rem 1.5rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
  }

  .form-label {
    font-size: 0.625rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  /* ── Input group ── */
  .input-group {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    padding: 0 0.875rem;
    transition: all 0.2s ease;
  }
  .input-group.ig-focused {
    border-color: rgba(245, 197, 24, 0.5);
    background: rgba(245, 197, 24, 0.04);
    box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.09);
  }
  .input-group.ig-filled:not(.ig-focused) {
    border-color: rgba(245, 197, 24, 0.2);
  }
  .input-group.ig-error {
    border-color: rgba(248, 113, 113, 0.45);
    background: rgba(248, 113, 113, 0.03);
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.08);
  }
  .input-group.ig-loading {
    opacity: 0.75;
    pointer-events: none;
  }

  .ig-left {
    color: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .input-group.ig-focused .ig-left,
  .input-group.ig-filled .ig-left {
    color: var(--color-primary, #f5c518);
  }

  .ig-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.9rem 0;
    font-size: 0.9375rem;
    font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.08em;
    caret-color: var(--color-primary, #f5c518);
    min-width: 0;
  }
  .ig-input::placeholder {
    color: rgba(255, 255, 255, 0.18);
    font-family: system-ui, sans-serif;
    font-weight: 400;
    letter-spacing: 0;
  }
  .ig-input:disabled {
    cursor: not-allowed;
  }

  .ig-clear {
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
    transition: all 0.15s;
  }
  .ig-clear:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .field-error {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #fca5a5;
  }

  /* ── CTA Button ── */
  .cta-btn {
    position: relative;
    overflow: hidden;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.9375rem;
    border-radius: 0.9rem;
    border: none;
    font-size: 0.9375rem;
    font-weight: 900;
    letter-spacing: 0.02em;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.18);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    margin-top: 0.25rem;
  }
  .cta-btn.cta-ready {
    background: var(--color-primary, #f5c518);
    color: #000;
    cursor: pointer;
    box-shadow:
      0 4px 24px rgba(245, 197, 24, 0.35),
      0 0 0 1px rgba(245, 197, 24, 0.2);
  }
  .cta-btn.cta-ready:hover {
    transform: translateY(-1px);
    box-shadow:
      0 8px 32px rgba(245, 197, 24, 0.45),
      0 0 0 1px rgba(245, 197, 24, 0.3);
    filter: brightness(1.05);
  }
  .cta-btn.cta-ready:active {
    transform: scale(0.98) translateY(0);
  }
  .cta-btn.cta-loading {
    background: var(--color-primary, #f5c518);
    color: #000;
    cursor: wait;
    opacity: 0.8;
  }

  .btn-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 255, 255, 0.5) 50%,
      transparent 60%
    );
    animation: shine 2.8s infinite;
    pointer-events: none;
  }
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    55% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  /* ── Card footer ── */
  .card-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.01);
    line-height: 1.5;
  }

  /* ── Shake ── */
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

  /* ── Spinner ── */
  .spin-icon {
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ── Trust row ── */
  .trust-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .trust-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.25);
  }
  .trust-icon {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .trust-green {
    background: rgba(52, 211, 153, 0.1);
    color: #34d399;
    border: 1px solid rgba(52, 211, 153, 0.15);
  }
  .trust-yellow {
    background: rgba(245, 197, 24, 0.1);
    color: var(--color-primary, #f5c518);
    border: 1px solid rgba(245, 197, 24, 0.15);
  }
  .trust-blue {
    background: rgba(96, 165, 250, 0.1);
    color: #60a5fa;
    border: 1px solid rgba(96, 165, 250, 0.15);
  }
  .trust-divider {
    width: 1px;
    height: 1.25rem;
    background: rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
  }

  /* ── Toast ── */
  .toast-wrap {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    width: calc(100% - 2rem);
    max-width: 420px;
    animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-12px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }
  .toast-inner {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.875rem 1rem;
    border-radius: 1rem;
    backdrop-filter: blur(16px);
    border: 1px solid;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.45;
  }
  .toast-error .toast-inner {
    background: rgba(20, 8, 8, 0.95);
    border-color: rgba(248, 113, 113, 0.25);
    color: #fca5a5;
  }
  .toast-info .toast-inner {
    background: rgba(14, 11, 3, 0.95);
    border-color: rgba(245, 197, 24, 0.2);
    color: rgba(245, 197, 24, 0.9);
  }
  .toast-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .toast-text {
    flex: 1;
  }
  .toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: inherit;
    opacity: 0.45;
    cursor: pointer;
    padding: 0.1rem;
    margin-left: 0.25rem;
    transition: opacity 0.15s;
    line-height: 1;
  }
  .toast-close:hover {
    opacity: 1;
  }

  /* ── Responsive ── */
  @media (max-width: 375px) {
    .form-body {
      padding: 1.25rem 1.125rem 1rem;
    }
    .title {
      font-size: 1.875rem;
    }
    .trust-row {
      gap: 0.625rem;
    }
    .trust-divider {
      display: none;
    }
  }
  @media (min-width: 640px) {
    .desc {
      font-size: 0.9375rem;
    }
    .card-footer {
      padding: 1rem 1.75rem;
    }
    .form-body {
      padding: 1.75rem 1.75rem 1.5rem;
    }
  }
</style>
