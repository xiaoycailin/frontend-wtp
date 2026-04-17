<script lang="ts">
  import { teleport } from "$lib/utils";
  import type { Product, SupportedGameConfig, ZoneInputMode } from "./types";
  import { fmt } from "./utils";
  import Icon from "@iconify/svelte";
  import "./modal.css";

  type CustomInput = {
    id: number;
    name: string;
    label: string;
    type: string;
    model: "input" | "select" | "textarea";
    placeholder?: string | null;
    options?: { label: string; value: string }[] | null;
    icon?: string | null;
    maskingForView?: boolean;
    subCategoryId?: string;
    createdAt?: string;
  };

  let {
    open = $bindable(false),
    loading = false,
    selected,
    userId,
    serverId,
    phone,
    email,
    selectedPay,
    gameConfig = null,
    zoneInputMode = "text",
    reviewData,
    displayBasePrice,
    displayFlashDiscount,
    displayDiscountLabel,
    displayIsFlashSale,
    displayFee,
    displayTotal,
    quantity,
    discountAmount,
    promoApplied,
    onConfirm,
    onCancel,
    customMode,
    inputs = [],
  }: {
    open: boolean;
    loading: boolean;
    selected: Product | null;
    userId: string;
    serverId: string;
    phone: string;
    email: string;
    selectedPay: any;
    gameConfig?: SupportedGameConfig | null;
    zoneInputMode?: ZoneInputMode;
    reviewData: any;
    displayBasePrice: number;
    displayFlashDiscount: number;
    displayDiscountLabel: string | null;
    displayIsFlashSale: boolean;
    displayFee: number;
    displayTotal: number;
    quantity: number;
    discountAmount: number;
    promoApplied: any;
    onConfirm: () => void;
    onCancel: () => void;
    customMode: boolean;
    inputs: CustomInput[];
  } = $props();

  let expandedFields = $state<Record<string, boolean>>({});
  let showMaskedFields = $state<Record<string, boolean>>({});

  $effect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && !loading) onCancel();
  }
  function toggleExpanded(name: string) {
    expandedFields[name] = !expandedFields[name];
  }
  function toggleMasked(name: string) {
    showMaskedFields[name] = !showMaskedFields[name];
  }
  function getDisplayValue(
    input: CustomInput,
    rawValue: string | undefined | null,
  ) {
    const value = rawValue ?? "";
    if (!input.maskingForView) return value;
    if (showMaskedFields[input.name]) return value;
    return value ? "•".repeat(Math.min(value.length, 64)) : "";
  }
  function getRawUserValue(name: string): string {
    return reviewData?.userData?.[name] ?? "";
  }

  const totalSaving = $derived(
    (displayIsFlashSale ? displayFlashDiscount : 0) + (discountAmount ?? 0),
  );
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div use:teleport>
    <!-- Backdrop -->
    <div
      class="m-backdrop"
      role="presentation"
      onclick={() => {
        if (!loading) onCancel();
      }}
    ></div>

    <!-- Sheet -->
    <div
      class="m-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Konfirmasi Pesanan"
    >
      <div class="m-drag-pill" aria-hidden="true"></div>
      <div class="m-top-glow" aria-hidden="true"></div>

      <!-- HEADER -->
      <div class="m-header">
        <div class="m-header-icon" aria-hidden="true">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <div class="m-header-text">
          <h2 class="m-title">Konfirmasi Pesanan</h2>
          <p class="m-subtitle">Periksa kembali sebelum membayar</p>
        </div>
        {#if !loading}
          <button
            class="m-close-btn"
            onclick={onCancel}
            aria-label="Tutup modal"
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

      <!-- SCROLLABLE BODY -->
      <div class="m-body" tabindex="-1">
        <!-- 1. Selected product -->
        {#if selected}
          <div class="m-section">
            <p class="m-section-label">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="10"
                height="10"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Item Dipesan
            </p>
            <div class="m-product-card">
              {#if selected.icon}
                <img
                  src={selected.icon}
                  alt={selected.label}
                  width="40"
                  height="40"
                  loading="lazy"
                  class="m-product-img"
                  aria-hidden="true"
                />
              {/if}
              <div class="m-product-info">
                <p class="m-product-name">{selected.label}</p>
                {#if selected.sublabel}
                  <p class="m-product-sub">{selected.sublabel}</p>
                {/if}
              </div>
              {#if quantity > 1}
                <span class="m-qty-badge">×{quantity}</span>
              {/if}
              {#if displayIsFlashSale}
                <span class="m-flash-badge" aria-label="Flash Sale aktif">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    width="9"
                    height="9"
                    aria-hidden="true"
                  >
                    <path
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    />
                  </svg>
                  FLASH
                </span>
              {/if}
            </div>
          </div>
        {/if}

        <!-- 2. Account data -->
        <div class="m-section">
          <p class="m-section-label">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="10"
              height="10"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Data Akun
          </p>
          <div class="m-info-panel">
            {#if customMode}
              {#each inputs as input (input.id)}
                {@const rawValue = getRawUserValue(input.name)}
                {@const displayVal = getDisplayValue(input, rawValue)}
                {@const isExpanded = expandedFields[input.name] === true}
                {@const isMasking = input.maskingForView === true}
                <div class="m-info-row">
                  <div class="m-info-key">
                    {#if input.icon}
                      <span class="m-info-key-icon" aria-hidden="true">
                        <Icon icon={input.icon} width="11" height="11" />
                      </span>
                    {/if}
                    {input.label}
                  </div>
                  <div class="m-info-val-group">
                    <button
                      type="button"
                      class="m-info-val-btn"
                      class:m-info-val-expanded={isExpanded}
                      onclick={() =>
                        rawValue.length > 24 && toggleExpanded(input.name)}
                      title={rawValue}
                    >
                      <span
                        class="m-info-val"
                        class:line-clamp-none={isExpanded}
                      >
                        {displayVal || "—"}
                      </span>
                      {#if rawValue.length > 24}
                        <span class="m-expand-icon" aria-hidden="true">
                          <Icon
                            icon={isExpanded
                              ? "mdi:chevron-up"
                              : "mdi:chevron-down"}
                            width="12"
                            height="12"
                          />
                        </span>
                      {/if}
                    </button>
                    {#if isMasking && rawValue}
                      <button
                        type="button"
                        class="m-eye-btn"
                        onclick={() => toggleMasked(input.name)}
                        aria-label={showMaskedFields[input.name]
                          ? "Sembunyikan"
                          : "Tampilkan"}
                      >
                        <Icon
                          icon={showMaskedFields[input.name]
                            ? "mdi:eye-off-outline"
                            : "mdi:eye-outline"}
                          width="13"
                          height="13"
                        />
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            {:else}
              {#if reviewData?.userData?.username}
                <div class="m-info-row">
                  <span class="m-info-key">Username</span>
                  <span class="m-info-val m-info-val-plain"
                    >{reviewData.userData.username}</span
                  >
                </div>
              {/if}
              <div class="m-info-row">
                <span class="m-info-key">User ID</span>
                <span class="m-info-val m-info-val-plain">{userId || "—"}</span>
              </div>
              {#if zoneInputMode !== "none" && serverId}
                <div class="m-info-row">
                  <span class="m-info-key"
                    >{zoneInputMode === "select" ? "Server" : "Server ID"}</span
                  >
                  <span class="m-info-val m-info-val-plain">
                    {zoneInputMode === "select"
                      ? serverId.toUpperCase()
                      : serverId}
                  </span>
                </div>
              {/if}
            {/if}

            <div class="m-info-divider" aria-hidden="true"></div>

            <div class="m-info-row">
              <span class="m-info-key">
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  width="10"
                  height="10"
                  aria-hidden="true"
                >
                  <path
                    d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                  />
                </svg>
                WhatsApp
              </span>
              <span class="m-info-val m-info-val-plain">{phone || "—"}</span>
            </div>
            <div class="m-info-row" style="border-bottom:none;">
              <span class="m-info-key">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="10"
                  height="10"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </span>
              <span class="m-info-val m-info-val-plain">{email || "—"}</span>
            </div>
          </div>
        </div>

        <!-- 3. Payment method -->
        {#if selectedPay}
          <div class="m-section">
            <p class="m-section-label">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="10"
                height="10"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Metode Pembayaran
            </p>
            <div class="m-pay-card">
              {#if selectedPay.logo ?? reviewData?.paymentIcon}
                <div class="m-pay-logo-wrap" aria-hidden="true">
                  <img
                    src={selectedPay.logo ?? reviewData?.paymentIcon}
                    alt={selectedPay.name ?? reviewData?.payment ?? ""}
                    class="m-pay-logo"
                    loading="lazy"
                  />
                </div>
              {/if}
              <div>
                <p class="m-pay-name">
                  {selectedPay.name ?? reviewData?.payment ?? selectedPay.id}
                </p>
                {#if selectedPay.autoCheck}
                  <p class="m-pay-auto">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="9"
                      height="9"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Konfirmasi otomatis
                  </p>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        <!-- 4. Price breakdown -->
        <div class="m-section">
          <p class="m-section-label">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="10"
              height="10"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Rincian Harga
          </p>
          <div class="m-price-panel">
            <div class="m-price-row">
              <span>Harga satuan</span>
              <span class="m-price-val">{fmt(displayBasePrice)}</span>
            </div>
            {#if quantity > 1}
              <div class="m-price-row">
                <span>Jumlah</span>
                <span class="m-price-val">×{quantity}</span>
              </div>
            {/if}
            {#if displayIsFlashSale && displayFlashDiscount > 0}
              <div class="m-price-row m-price-row-discount">
                <span class="flex items-center gap-1.5">
                  <span class="m-flash-badge-sm" aria-label="Flash Sale">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      width="8"
                      height="8"
                      aria-hidden="true"
                    >
                      <path
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      />
                    </svg>
                    FLASH
                  </span>
                  {displayDiscountLabel ?? "Flash Sale"}
                </span>
                <span class="m-price-discount"
                  >−{fmt(displayFlashDiscount)}</span
                >
              </div>
            {/if}
            {#if discountAmount > 0}
              <div class="m-price-row m-price-row-promo">
                <span>
                  Promo
                  <span class="m-promo-tag">{promoApplied?.code}</span>
                </span>
                <span class="m-price-promo">−{fmt(discountAmount)}</span>
              </div>
            {/if}
            <div class="m-price-row">
              <span>Biaya layanan</span>
              {#if displayFee > 0}
                <span class="m-price-val">+{fmt(displayFee)}</span>
              {:else}
                <span class="m-price-free">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    width="9"
                    height="9"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Gratis
                </span>
              {/if}
            </div>
            <div class="m-total-row">
              <div>
                <p class="m-total-label">Total Pembayaran</p>
                {#if totalSaving > 0}
                  <p class="m-total-saving">Hemat {fmt(totalSaving)}</p>
                {/if}
              </div>
              <span class="m-total-amount">{fmt(displayTotal)}</span>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div class="m-warning" role="alert">
          <div class="m-warning-icon" aria-hidden="true">
            <svg fill="currentColor" viewBox="0 0 20 20" width="13" height="13">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <p class="m-warning-text">
            Pastikan <strong>User ID</strong> sudah benar. Pesanan yang sudah
            dibayar
            <strong>tidak dapat dibatalkan</strong>.
          </p>
        </div>
      </div>
      <!-- /m-body -->

      <!-- FOOTER -->
      <div class="m-footer">
        <button
          type="button"
          class="m-btn-cancel"
          disabled={loading}
          onclick={onCancel}
          aria-label="Batalkan pesanan"
        >
          Batal
        </button>
        <button
          type="button"
          class="m-btn-confirm"
          class:m-btn-loading={loading}
          disabled={loading}
          onclick={onConfirm}
          aria-label={loading ? "Memproses pesanan" : "Konfirmasi dan bayar"}
        >
          {#if loading}
            <svg
              class="m-spinner"
              viewBox="0 0 24 24"
              fill="none"
              width="16"
              height="16"
              aria-hidden="true"
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
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
            Memproses...
          {:else}
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Pesan Sekarang
          {/if}
          {#if !loading}
            <div class="m-btn-shine" aria-hidden="true"></div>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ══════════════════════════════
     BACKDROP
  ══════════════════════════════ */
  .m-backdrop {
    position: fixed;
    inset: 0;
    /* ✅ z-index tinggi banget — di atas sticky bar halaman produk */
    z-index: 99998;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: fade-in 0.22s ease;
  }

  /* ══════════════════════════════
     SHEET / DIALOG
  ══════════════════════════════ */
  .m-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    /* ✅ Satu level di atas backdrop */
    z-index: 99999;
    display: flex;
    flex-direction: column;
    /* ✅ Kalkulasi tinggi mempertimbangkan safe area + bottom nav bar apapun */
    max-height: calc(92dvh - env(safe-area-inset-bottom, 0px));
    border-radius: 1.5rem 1.5rem 0 0;
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-bottom: none;
    box-shadow:
      0 -20px 60px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(0, 0, 0, 0.5);
    animation: sheet-up 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    /* ✅ Isolate stacking context agar tidak terpengaruh parent */
    isolation: isolate;
  }

  @media (min-width: 640px) {
    .m-sheet {
      inset: 0;
      bottom: unset;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: min(480px, calc(100vw - 2rem));
      max-height: 88dvh;
      border-radius: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.09);
      animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  /* Drag pill */
  .m-drag-pill {
    width: 2.5rem;
    height: 3px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0.625rem auto 0;
    flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .m-drag-pill {
      display: none;
    }
  }

  /* Ambient glow */
  .m-top-glow {
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 3rem;
    background: radial-gradient(
      ellipse at 50% 0%,
      rgba(245, 197, 24, 0.07),
      transparent 80%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* ══════════════════════════════
     HEADER
  ══════════════════════════════ */
  .m-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem 0.875rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .m-header-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    flex-shrink: 0;
    background: #f5c518;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    box-shadow: 0 0 16px rgba(245, 197, 24, 0.35);
  }
  .m-title {
    font-size: 1rem;
    font-weight: 900;
    color: #fff;
    line-height: 1.2;
  }
  .m-subtitle {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 0.1rem;
  }
  .m-close-btn {
    margin-left: auto;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.09);
    color: rgba(255, 255, 255, 0.45);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .m-close-btn:hover {
    background: rgba(239, 68, 68, 0.14);
    border-color: rgba(239, 68, 68, 0.28);
    color: #f87171;
  }

  /* ══════════════════════════════
     BODY  (scrollable)
  ══════════════════════════════ */
  .m-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.75rem 1.125rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    /* ✅ Pastikan body tidak overflow ke luar sheet */
    min-height: 0;
  }
  .m-body::-webkit-scrollbar {
    width: 3px;
  }
  .m-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .m-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
  }
  .m-body::-webkit-scrollbar-thumb:hover {
    background: rgba(245, 197, 24, 0.3);
  }

  /* ══════════════════════════════
     SECTIONS
  ══════════════════════════════ */
  .m-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .m-section-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.5625rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    padding-left: 0.125rem;
  }

  /* Product card */
  .m-product-card {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .m-product-img {
    width: 2.75rem;
    height: 2.75rem;
    object-fit: contain;
    border-radius: 0.625rem;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);
  }
  .m-product-info {
    flex: 1;
    min-width: 0;
  }
  .m-product-name {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .m-product-sub {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.35);
    margin-top: 0.15rem;
  }
  .m-qty-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.08);
    font-size: 0.75rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
  }
  .m-flash-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    flex-shrink: 0;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.28);
    color: #f87171;
    font-size: 0.5625rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* Info panel */
  .m-info-panel {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.025);
    overflow: hidden;
  }
  .m-info-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.6rem 0.875rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .m-info-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
  }
  .m-info-key {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.35);
    font-weight: 600;
    flex-shrink: 0;
    padding-top: 0.1rem;
    min-width: 4.5rem;
  }
  .m-info-key-icon {
    color: rgba(255, 255, 255, 0.25);
  }
  .m-info-val-group {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 0;
    flex: 1;
    justify-content: flex-end;
  }
  .m-info-val-btn {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: right;
    min-width: 0;
    color: inherit;
  }
  .m-info-val {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #fff;
    text-align: right;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }
  .line-clamp-none {
    display: block !important;
    -webkit-line-clamp: unset !important;
    overflow: visible !important;
  }
  .m-info-val-plain {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #fff;
    text-align: right;
    word-break: break-all;
  }
  .m-expand-icon {
    color: rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
    margin-top: 0.15rem;
  }
  .m-eye-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.4rem;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.09);
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .m-eye-btn:hover {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.2);
    color: #f5c518;
  }

  /* Payment card */
  .m-pay-card {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .m-pay-logo-wrap {
    width: 3.5rem;
    height: 2rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.07);
    border-radius: 0.5rem;
    padding: 0.25rem;
  }
  .m-pay-logo {
    max-height: 1.5rem;
    max-width: 100%;
    object-fit: contain;
  }
  .m-pay-name {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #fff;
  }
  .m-pay-auto {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.15rem;
    font-size: 0.625rem;
    color: #34d399;
    font-weight: 700;
  }

  /* Price panel */
  .m-price-panel {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.025);
    overflow: hidden;
  }
  .m-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.875rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
    gap: 0.5rem;
  }
  .m-price-row:last-child {
    border-bottom: none;
  }
  .m-price-val {
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
    font-variant-numeric: tabular-nums;
  }
  .m-price-discount {
    font-size: 0.8125rem;
    font-weight: 800;
    color: #f87171;
    font-variant-numeric: tabular-nums;
  }
  .m-price-promo {
    font-size: 0.8125rem;
    font-weight: 800;
    color: #34d399;
    font-variant-numeric: tabular-nums;
  }
  .m-price-free {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 800;
    color: #34d399;
  }
  .m-price-row-discount {
    background: rgba(239, 68, 68, 0.04);
  }
  .m-price-row-promo {
    background: rgba(52, 211, 153, 0.04);
  }
  .m-flash-badge-sm {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.15rem 0.35rem;
    border-radius: 0.3rem;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.22);
    color: #f87171;
    font-size: 0.5rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .m-promo-tag {
    display: inline-flex;
    padding: 0.1rem 0.35rem;
    border-radius: 0.3rem;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.2);
    color: #34d399;
    font-size: 0.5625rem;
    font-weight: 900;
    letter-spacing: 0.06em;
  }

  /* Total row */
  .m-total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem;
    background: rgba(245, 197, 24, 0.04);
    border-top: 1px solid rgba(245, 197, 24, 0.1);
    gap: 0.5rem;
  }
  .m-total-label {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 700;
  }
  .m-total-saving {
    font-size: 0.5625rem;
    color: #34d399;
    font-weight: 800;
    margin-top: 0.15rem;
    letter-spacing: 0.02em;
  }
  .m-total-amount {
    font-size: 1.375rem;
    font-weight: 900;
    color: #f5c518;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 18px rgba(245, 197, 24, 0.4);
  }

  /* Warning */
  .m-warning {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.75rem 0.875rem;
    border-radius: 0.875rem;
    background: rgba(245, 197, 24, 0.05);
    border: 1px solid rgba(245, 197, 24, 0.15);
  }
  .m-warning-icon {
    width: 1.625rem;
    height: 1.625rem;
    border-radius: 0.5rem;
    flex-shrink: 0;
    background: rgba(245, 197, 24, 0.12);
    border: 1px solid rgba(245, 197, 24, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f5c518;
  }
  .m-warning-text {
    font-size: 0.6875rem;
    color: rgba(245, 197, 24, 0.6);
    line-height: 1.55;
    max-width: none;
  }
  .m-warning-text strong {
    color: rgba(245, 197, 24, 0.85);
    font-weight: 800;
  }

  /* ══════════════════════════════
     FOOTER  ← PERBAIKAN UTAMA
  ══════════════════════════════ */
  .m-footer {
    display: flex;
    gap: 0.625rem;
    /* ✅ Safe area padding: inset bawah + extra buffer untuk nav bar */
    padding: 0.875rem 1.125rem;
    padding-bottom: calc(0.875rem + env(safe-area-inset-bottom, 16px));
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    /* ✅ Tidak pernah di-shrink — footer selalu visible */
    flex-shrink: 0;
    background: #0d0d0d;
    /* ✅ Isolate dari stacking context luar */
    position: relative;
    z-index: 1;
  }

  .m-btn-cancel {
    flex: 0 0 auto;
    padding: 0.8125rem 1.125rem;
    border-radius: 0.875rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.09);
    font-size: 0.875rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.45);
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .m-btn-cancel:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
  }
  .m-btn-cancel:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .m-btn-confirm {
    position: relative;
    overflow: hidden;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border-radius: 0.875rem;
    border: none;
    background: #f5c518;
    color: #000;
    font-size: 0.9375rem;
    font-weight: 900;
    letter-spacing: 0.01em;
    cursor: pointer;
    box-shadow:
      0 0 0 1px rgba(245, 197, 24, 0.25),
      0 4px 20px rgba(245, 197, 24, 0.35),
      0 0 50px rgba(245, 197, 24, 0.1);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .m-btn-confirm:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow:
      0 0 0 1px rgba(245, 197, 24, 0.35),
      0 8px 28px rgba(245, 197, 24, 0.45),
      0 0 60px rgba(245, 197, 24, 0.15);
  }
  .m-btn-confirm:active:not(:disabled) {
    transform: scale(0.97);
    transition-duration: 0.1s;
  }
  .m-btn-confirm:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .m-btn-loading {
    background: rgba(245, 197, 24, 0.7) !important;
    box-shadow: none !important;
    cursor: not-allowed;
  }
  .m-btn-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 35%,
      rgba(255, 255, 255, 0.35) 50%,
      transparent 65%
    );
    animation: shine 2.5s ease infinite;
    pointer-events: none;
  }
  .m-spinner {
    animation: spin 0.75s linear infinite;
  }

  /* ══════════════════════════════
     KEYFRAMES
  ══════════════════════════════ */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes sheet-up {
    from {
      transform: translateY(100%);
      opacity: 0.6;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes modal-in {
    from {
      transform: translate(-50%, calc(-50% + 1.5rem));
      opacity: 0;
    }
    to {
      transform: translate(-50%, -50%);
      opacity: 1;
    }
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
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
