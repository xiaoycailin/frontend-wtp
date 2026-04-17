<script lang="ts">
  import { toastStore } from "$lib/components/Toast/state";
  import type { AvailablePromo, PromoApplied, Product } from "./types";

  let {
    promoApplied = $bindable<PromoApplied | null>(null),
    selected = null,
    quantity = 1,
  }: {
    promoApplied: PromoApplied | null;
    selected?: Product | null;
    quantity?: number;
  } = $props();

  let promoCode = $state("");
  let promoError = $state("");
  let showPromos = $state(false);
  let loading = $state(false);
  let promos = $state<AvailablePromo[]>([]);
  let lastFetchKey = $state("");
  let applying = $state(false); // loading saat apply
  let inputFocused = $state(false);

  /* ── fetch ── */
  async function fetchPromos() {
    if (!selected) {
      promos = [];
      return;
    }
    loading = true;
    promoError = "";
    try {
      const params = new URLSearchParams();
      params.set("itemId", String(selected.id));
      params.set("qty", String(quantity || 1));
      if (selected.productFlashId) params.set("flashId", String(selected.id));
      const res = await fetch(`/api/v1/promotions/available?${params}`);
      const json = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal memuat promo",
        );
      promos = json?.data ?? [];
    } catch (e: any) {
      promoError = e?.message ?? "Gagal memuat promo";
      promos = [];
    } finally {
      loading = false;
    }
  }

  async function applyFoundPromo(found: AvailablePromo) {
    if (!found.valid) {
      promoApplied = null;
      promoError =
        found.reason ?? "Kode promo tidak bisa dipakai untuk item ini.";
      toastStore.show(promoError, "error", 3500);
      return;
    }
    applying = true;
    const req = await fetch("/api/v1/promotions/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: found.id,
        itemId: selected?.id,
        flashId: selected?.productFlashId,
      }),
    });
    applying = false;
    if (!req.ok) {
      const data = await req.json();
      promoError = data.data?.message ?? "Error saat menggunakan promo.";
      return toastStore.show(promoError, "error");
    }
    promoApplied = {
      id: found.id,
      code: found.code,
      title: found.title,
      desc:
        found.discType === "percent"
          ? `Potongan ${found.value}%`
          : `Potongan Rp ${found.value.toLocaleString("id-ID")}`,
      discount: found.previewDiscount,
      discType: found.discType,
      valid: true,
      reason: null,
      previewDiscount: found.previewDiscount,
      minTrx: found.minTrx,
      maxDiscount: found.maxDiscount,
    };
    promoCode = found.code;
    promoError = "";
    toastStore.show(`Promo ${found.code} berhasil dipakai 🎉`, "success", 2500);
  }

  function applyPromo() {
    promoError = "";
    const normalized = promoCode.trim().toUpperCase();
    if (!normalized) return;
    const found = promos.find((p) => p.code === normalized);
    if (found) {
      applyFoundPromo(found);
      return;
    }
    promoApplied = null;
    promoError = "Kode promo tidak ditemukan untuk produk ini.";
    toastStore.show(promoError, "error", 3500);
  }

  function removePromo() {
    promoApplied = null;
    promoCode = "";
    promoError = "";
  }

  function usePromo(promo: AvailablePromo) {
    promoCode = promo.code;
    showPromos = false;
    applyFoundPromo(promo);
  }

  $effect(() => {
    const key = selected
      ? `${selected.id}-${selected.productFlashId ?? "regular"}-${quantity}`
      : "";
    if (!key) {
      promos = [];
      lastFetchKey = "";
      return;
    }
    if (key !== lastFetchKey) {
      lastFetchKey = key;
      fetchPromos();
    }
  });

  $effect(() => {
    if (!promoApplied || !promoCode) return;
    const refreshed = promos.find(
      (p) => p.code === promoCode.trim().toUpperCase(),
    );
    if (refreshed && !refreshed.valid) promoApplied = null;
  });
</script>

<div class="step-card">
  <div class="step-accent" aria-hidden="true"></div>

  <div class="card-inner">
    <!-- ── Header ── -->
    <div class="step-header">
      <div class="step-badge"><span>4</span></div>
      <div class="header-text">
        <h3 class="step-title">Kode Promo</h3>
        <p class="step-subtitle">Hemat lebih banyak dengan promo eksklusif</p>
      </div>
      {#if promoApplied}
        <div class="active-pill">
          <span class="active-dot"></span>
          <span>{promoApplied.code}</span>
        </div>
      {/if}
    </div>

    <!-- ── Applied state ── -->
    {#if promoApplied}
      <div class="applied-box">
        <!-- shimmer line -->
        <div class="applied-shimmer" aria-hidden="true"></div>

        <div class="applied-left">
          <div class="applied-icon-wrap">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="applied-code">{promoApplied.code}</p>
            <p class="applied-desc">{promoApplied.desc}</p>
          </div>
        </div>

        <button
          class="applied-remove"
          onclick={removePromo}
          aria-label="Hapus promo"
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
          <span>Hapus</span>
        </button>
      </div>

      <!-- ── Input state ── -->
    {:else}
      <div class="input-row">
        <div
          class="promo-input-wrap"
          class:focused={inputFocused}
          class:has-error={!!promoError}
        >
          <!-- Tag icon -->
          <svg
            class="promo-input-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="15"
            height="15"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z"
            />
          </svg>

          <input
            type="text"
            bind:value={promoCode}
            onfocus={() => {
              inputFocused = true;
              promoError = "";
            }}
            onblur={() => (inputFocused = false)}
            oninput={() => {
              promoCode = promoCode.toUpperCase();
              promoError = "";
            }}
            onkeydown={(e) => e.key === "Enter" && applyPromo()}
            placeholder="Masukkan kode promo"
            autocomplete="off"
            spellcheck="false"
            class="promo-input"
            aria-label="Kode promo"
          />

          {#if promoCode}
            <button
              type="button"
              class="input-clear"
              onclick={() => {
                promoCode = "";
                promoError = "";
              }}
              aria-label="Hapus teks"
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
                  stroke-width="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          {/if}
        </div>

        <button
          type="button"
          class="apply-btn"
          class:apply-active={!!promoCode.trim() && !applying}
          class:apply-loading={applying}
          onclick={applyPromo}
          disabled={!promoCode.trim() || applying}
        >
          {#if applying}
            <svg
              class="btn-spin"
              viewBox="0 0 24 24"
              fill="none"
              width="14"
              height="14"
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
          {:else}
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          {/if}
          {applying ? "..." : "Pakai"}
        </button>
      </div>

      <!-- Error message -->
      {#if promoError}
        <div class="error-row" role="alert">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            width="12"
            height="12"
            class="flex-shrink-0"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{promoError}</span>
        </div>
      {/if}
    {/if}

    <!-- ── Toggle: daftar promo ── -->
    <button
      type="button"
      class="toggle-btn"
      class:toggle-open={showPromos}
      onclick={() => {
        showPromos = !showPromos;
        if (showPromos && !promos.length) fetchPromos();
      }}
      aria-expanded={showPromos}
    >
      <span class="toggle-icon">🎁</span>
      <span class="toggle-text">Promo Tersedia</span>
      {#if promos.length > 0 && !loading}
        <span class="toggle-count">{promos.length}</span>
      {/if}
      <svg
        class="toggle-chevron"
        class:toggle-chevron-open={showPromos}
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
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- ── Promo list panel ── -->
    {#if showPromos}
      <div class="promo-panel">
        {#if loading}
          <!-- Skeleton -->
          <div class="promo-skeletons">
            {#each [1, 2, 3] as _}
              <div class="promo-skeleton">
                <div class="skel-icon"></div>
                <div class="skel-body">
                  <div class="skel-line skel-line-title"></div>
                  <div class="skel-line skel-line-sub"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if !promos.length}
          <div class="promo-empty">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="28"
              height="28"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>Belum ada promo untuk item ini</p>
          </div>
        {:else}
          <div class="promo-list">
            {#each promos as promo}
              <button
                type="button"
                class="promo-item"
                class:promo-invalid={!promo.valid}
                onclick={() => usePromo(promo)}
                disabled={!promo.valid}
              >
                <!-- Left: icon -->
                <div
                  class="promo-item-icon"
                  class:promo-item-icon-invalid={!promo.valid}
                >
                  {#if promo.valid}
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z"
                      />
                    </svg>
                  {:else}
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      />
                    </svg>
                  {/if}
                </div>

                <!-- Center: info -->
                <div class="promo-item-body">
                  <div class="promo-item-top">
                    <span class="promo-item-title">{promo.title}</span>
                    <span
                      class="promo-code-chip"
                      class:promo-code-invalid={!promo.valid}
                    >
                      {promo.code}
                    </span>
                  </div>
                  <p class="promo-item-desc">
                    {promo.discType === "percent"
                      ? `Diskon ${promo.value}%`
                      : `Diskon Rp ${promo.value.toLocaleString("id-ID")}`}
                    {#if promo.previewDiscount > 0}
                      <span class="promo-saving">
                        · hemat ~Rp {promo.previewDiscount.toLocaleString(
                          "id-ID",
                        )}
                      </span>
                    {/if}
                  </p>
                  {#if promo.reason}
                    <p class="promo-reason">{promo.reason}</p>
                  {/if}
                </div>

                <!-- Right: CTA -->
                <div
                  class="promo-item-cta"
                  class:promo-cta-invalid={!promo.valid}
                >
                  {#if promo.valid}
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
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  {:else}
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
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  /* ── Shell ── */
  .step-card {
    position: relative;
    border-radius: 1.125rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #0f0f0f;
    overflow: hidden;
  }
  .step-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--color-primary),
      rgba(245, 197, 24, 0.3) 55%,
      transparent
    );
    z-index: 1;
  }
  .card-inner {
    padding: 1.25rem 1.25rem 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  /* ── Header ── */
  .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .step-badge {
    width: 1.875rem;
    height: 1.875rem;
    border-radius: 0.625rem;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.8125rem;
    font-weight: 900;
    color: #000;
    box-shadow: 0 0 14px rgba(245, 197, 24, 0.3);
  }
  .header-text {
    flex: 1;
    min-width: 0;
  }
  .step-title {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
  }
  .step-subtitle {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 0.1rem;
  }
  .active-pill {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.25);
    color: #34d399;
    font-size: 0.625rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .active-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 6px rgba(52, 211, 153, 0.8);
    animation: adot 1.6s ease-in-out infinite;
  }
  @keyframes adot {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }

  /* ── Applied box ── */
  .applied-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 0.875rem;
    background: rgba(52, 211, 153, 0.07);
    border: 1px solid rgba(52, 211, 153, 0.2);
    overflow: hidden;
  }
  .applied-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(52, 211, 153, 0.08),
      transparent
    );
    animation: shimmer 2.5s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 160%;
    }
  }

  .applied-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;
  }
  .applied-icon-wrap {
    width: 2rem;
    height: 2rem;
    border-radius: 0.625rem;
    background: rgba(52, 211, 153, 0.15);
    border: 1px solid rgba(52, 211, 153, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #34d399;
  }
  .applied-code {
    font-size: 0.875rem;
    font-weight: 900;
    color: #34d399;
    letter-spacing: 0.06em;
  }
  .applied-desc {
    font-size: 0.6875rem;
    color: rgba(52, 211, 153, 0.55);
    margin-top: 0.1rem;
  }
  .applied-remove {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3125rem 0.625rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.6875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }
  .applied-remove:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #f87171;
  }

  /* ── Input row ── */
  .input-row {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
  }
  .promo-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 0.875rem;
    padding: 0 0.875rem;
    transition: all 0.2s ease;
  }
  .promo-input-wrap.focused {
    border-color: rgba(245, 197, 24, 0.45);
    background: rgba(245, 197, 24, 0.04);
    box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.07);
  }
  .promo-input-wrap.has-error {
    border-color: rgba(239, 68, 68, 0.45);
    background: rgba(239, 68, 68, 0.04);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.07);
  }
  .promo-input-icon {
    color: rgba(255, 255, 255, 0.25);
    flex-shrink: 0;
    transition: color 0.2s;
  }
  .promo-input-wrap.focused .promo-input-icon {
    color: var(--color-primary);
  }
  .promo-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.6875rem 0;
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.06em;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    caret-color: var(--color-primary);
  }
  .promo-input::placeholder {
    color: rgba(255, 255, 255, 0.18);
    font-weight: 400;
    letter-spacing: 0;
    font-family: inherit;
  }
  .input-clear {
    width: 1.375rem;
    height: 1.375rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }
  .input-clear:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  /* ── Apply button ── */
  .apply-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.6875rem 1rem;
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.2);
    font-size: 0.8125rem;
    font-weight: 800;
    cursor: not-allowed;
    white-space: nowrap;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    flex-shrink: 0;
  }
  .apply-active {
    background: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    color: #000 !important;
    cursor: pointer !important;
    box-shadow: 0 4px 18px rgba(245, 197, 24, 0.35);
  }
  .apply-active:hover {
    filter: brightness(1.1);
    box-shadow: 0 6px 24px rgba(245, 197, 24, 0.45);
    transform: translateY(-1px);
  }
  .apply-active:active {
    transform: scale(0.96);
  }
  .apply-loading {
    background: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    color: #000 !important;
    cursor: wait !important;
    opacity: 0.75;
  }
  .btn-spin {
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ── Error ── */
  .error-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.6875rem;
    color: #f87171;
    padding: 0.5rem 0.75rem;
    border-radius: 0.625rem;
    background: rgba(239, 68, 68, 0.07);
    border: 1px solid rgba(239, 68, 68, 0.15);
  }

  /* ── Toggle button ── */
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.625rem 0.875rem;
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.025);
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }
  .toggle-btn:hover,
  .toggle-open {
    background: rgba(245, 197, 24, 0.07);
    border-color: rgba(245, 197, 24, 0.25);
    color: var(--color-primary);
  }
  .toggle-icon {
    font-size: 0.875rem;
    line-height: 1;
  }
  .toggle-text {
    flex: 1;
  }
  .toggle-count {
    background: rgba(245, 197, 24, 0.15);
    color: var(--color-primary);
    font-size: 0.5625rem;
    font-weight: 900;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    min-width: 1.25rem;
    text-align: center;
  }
  .toggle-chevron {
    color: rgba(255, 255, 255, 0.25);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .toggle-chevron-open {
    transform: rotate(180deg);
  }

  /* ── Promo panel ── */
  .promo-panel {
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
  }

  /* Skeleton */
  .promo-skeletons {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .promo-skeleton {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .promo-skeleton:last-child {
    border-bottom: none;
  }
  .skel-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
    animation: skelfade 1.4s ease-in-out infinite;
  }
  .skel-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .skel-line {
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    animation: skelfade 1.4s ease-in-out infinite;
  }
  .skel-line-title {
    height: 10px;
    width: 55%;
  }
  .skel-line-sub {
    height: 8px;
    width: 80%;
    animation-delay: 0.15s;
  }
  @keyframes skelfade {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  /* Empty */
  .promo-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
    padding: 1.75rem 1rem;
    color: rgba(255, 255, 255, 0.2);
  }
  .promo-empty p {
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
  }

  /* Promo list */
  .promo-list {
    display: flex;
    flex-direction: column;
  }

  .promo-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: all 0.18s ease;
  }
  .promo-item:last-child {
    border-bottom: none;
  }
  .promo-item:hover:not(.promo-invalid) {
    background: rgba(245, 197, 24, 0.06);
  }
  .promo-invalid {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .promo-item-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: rgba(245, 197, 24, 0.1);
    border: 1px solid rgba(245, 197, 24, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-primary);
    transition: all 0.18s;
  }
  .promo-item-icon-invalid {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }
  .promo-item:hover:not(.promo-invalid) .promo-item-icon {
    background: rgba(245, 197, 24, 0.18);
    box-shadow: 0 0 12px rgba(245, 197, 24, 0.2);
  }

  .promo-item-body {
    flex: 1;
    min-width: 0;
  }
  .promo-item-top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.2rem;
  }
  .promo-item-title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    transition: color 0.18s;
  }
  .promo-item:hover:not(.promo-invalid) .promo-item-title {
    color: #fff;
  }

  .promo-code-chip {
    font-size: 0.5625rem;
    font-weight: 900;
    padding: 0.15rem 0.45rem;
    border-radius: 0.375rem;
    background: rgba(245, 197, 24, 0.12);
    color: var(--color-primary);
    letter-spacing: 0.08em;
    font-family: "JetBrains Mono", monospace;
    border: 1px solid rgba(245, 197, 24, 0.2);
  }
  .promo-code-invalid {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.2);
  }

  .promo-item-desc {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.35);
  }
  .promo-saving {
    color: rgba(52, 211, 153, 0.7);
  }
  .promo-reason {
    font-size: 0.625rem;
    color: #f87171;
    margin-top: 0.2rem;
  }

  .promo-item-cta {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: rgba(245, 197, 24, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-primary);
    transition: all 0.18s;
  }
  .promo-cta-invalid {
    background: rgba(239, 68, 68, 0.08);
    color: #f87171;
  }
  .promo-item:hover:not(.promo-invalid) .promo-item-cta {
    background: var(--color-primary);
    color: #000;
    box-shadow: 0 3px 10px rgba(245, 197, 24, 0.35);
    transform: translateX(2px);
  }
</style>
