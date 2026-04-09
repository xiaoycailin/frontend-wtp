<script lang="ts">
  import { teleport } from "$lib/utils";
  import type { Product } from "./types";
  import { fmt } from "./utils";

  let {
    open = $bindable(false),
    loading = false,
    selected,
    userId,
    serverId,
    phone,
    email,
    selectedPay,
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
  }: {
    open: boolean;
    loading: boolean;
    selected: Product | null;
    userId: string;
    serverId: string;
    phone: string;
    email: string;
    selectedPay: any;
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
  } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && !loading) onCancel();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Wrapper di-teleport ke body, keluar dari semua stacking context -->
  <div use:teleport>
    <!-- Backdrop -->
    <div
      class="modal-backdrop"
      role="presentation"
      onclick={() => {
        if (!loading) onCancel();
      }}
    ></div>

    <!-- Modal -->
    <div
      class="modal-wrapper"
      role="dialog"
      aria-modal="true"
      aria-label="Konfirmasi Pesanan"
    >
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-icon">
            <svg
              class="w-5 h-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div>
            <h2 class="modal-title">Konfirmasi Pesanan</h2>
            <p class="modal-subtitle">Pastikan semua data sudah benar</p>
          </div>
          {#if !loading}
            <button class="modal-close" onclick={onCancel} aria-label="Tutup">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          {/if}
        </div>

        <!-- Scrollable body -->
        <div class="modal-body">
          {#if selected}
            <section class="modal-section">
              <p class="modal-section-label">Item yang Dipesan</p>
              <div class="modal-product-card">
                {#if selected.icon}
                  <img
                    src={selected.icon}
                    alt={selected.label}
                    width="36"
                    height="36"
                    class="rounded-lg object-contain flex-shrink-0"
                  />
                {/if}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-white truncate">
                    {selected.label}
                  </p>
                  {#if selected.sublabel}
                    <p class="text-[11px] text-white/40 mt-0.5">
                      {selected.sublabel}
                    </p>
                  {/if}
                </div>
                {#if displayIsFlashSale}
                  <span class="flash-badge">âš¡ Flash Sale</span>
                {/if}
              </div>
            </section>
          {/if}

          <section class="modal-section">
            <p class="modal-section-label">Data Akun</p>
            <div class="modal-info-grid">
              <div class="modal-info-row">
                <span class="modal-info-key">User ID</span>
                <span class="modal-info-val">{userId || "-"}</span>
              </div>
              {#if serverId}
                <div class="modal-info-row">
                  <span class="modal-info-key">Server ID</span>
                  <span class="modal-info-val">{serverId}</span>
                </div>
              {/if}
              <div class="modal-info-row">
                <span class="modal-info-key">No. WhatsApp</span>
                <span class="modal-info-val">{phone || "-"}</span>
              </div>
              <div class="modal-info-row">
                <span class="modal-info-key">Email</span>
                <span class="modal-info-val">{email || "-"}</span>
              </div>
            </div>
          </section>

          {#if selectedPay}
            <section class="modal-section">
              <p class="modal-section-label">Metode Pembayaran</p>
              <div class="modal-pay-row">
                {#if selectedPay.logo ?? reviewData?.paymentIcon}
                  <img
                    src={selectedPay.logo ?? reviewData?.paymentIcon}
                    alt={selectedPay.name ?? reviewData?.payment}
                    class="h-6 object-contain"
                  />
                {/if}
                <span class="text-sm font-bold text-white">
                  {selectedPay.name ?? reviewData?.payment ?? selectedPay.id}
                </span>
              </div>
            </section>
          {/if}

          <section class="modal-section">
            <p class="modal-section-label">Rincian Harga</p>
            <div class="modal-price-list">
              <div class="modal-price-row">
                <span>Harga satuan</span>
                <span>{fmt(displayBasePrice)}</span>
              </div>
              {#if quantity > 1}
                <div class="modal-price-row">
                  <span>Jumlah</span>
                  <span>Ã—{quantity}</span>
                </div>
              {/if}
              {#if displayIsFlashSale && displayFlashDiscount > 0}
                <div class="modal-price-row discount">
                  <span class="flex items-center gap-1.5">
                    <span class="flash-badge-sm">âš¡ FLASH</span>
                    {displayDiscountLabel ?? "Diskon Flash Sale"}
                  </span>
                  <span>-{fmt(displayFlashDiscount)}</span>
                </div>
              {/if}
              {#if discountAmount > 0}
                <div class="modal-price-row discount">
                  <span>Diskon ({promoApplied?.code})</span>
                  <span>-{fmt(discountAmount)}</span>
                </div>
              {/if}
              {#if displayFee > 0}
                <div class="modal-price-row">
                  <span>Biaya Admin</span>
                  <span>+{fmt(displayFee)}</span>
                </div>
              {:else}
                <div class="modal-price-row free">
                  <span>Biaya Layanan</span>
                  <span>Gratis</span>
                </div>
              {/if}
              <div class="modal-total-row">
                <span>Total Pembayaran</span>
                <span class="modal-total-amount">{fmt(displayTotal)}</span>
              </div>
            </div>
          </section>

          <div class="modal-warning">
            <svg
              class="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <p>
              Pastikan <strong>User ID</strong> sudah benar. Pesanan yang sudah
              dibayar
              <strong>tidak dapat dibatalkan</strong>.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button
            disabled={loading}
            onclick={onCancel}
            class="modal-btn-cancel"
          >
            Batalkan
          </button>
          <button
            disabled={loading}
            onclick={onConfirm}
            class="modal-btn-confirm"
          >
            {#if loading}
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Memproses...
            {:else}
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Konfirmasi Order
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    animation: fadeIn 200ms ease;
  }
  .modal-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
    animation: slideUp 280ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  @media (min-width: 640px) {
    .modal-wrapper {
      align-items: center;
      padding: 1rem;
      animation: scaleIn 250ms cubic-bezier(0.16, 1, 0.3, 1);
    }
  }
  .modal-container {
    width: 100%;
    max-width: 440px;
    max-height: 90dvh;
    display: flex;
    flex-direction: column;
    background: #161616;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 1.25rem 1.25rem 0 0;
    overflow: hidden;
    box-shadow:
      0 -8px 40px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.04);
  }
  @media (min-width: 640px) {
    .modal-container {
      border-radius: 1.25rem;
      box-shadow:
        0 24px 64px rgba(0, 0, 0, 0.7),
        0 0 0 1px rgba(255, 255, 255, 0.04);
    }
  }
  .modal-header {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1.25rem 1.25rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }
  .modal-icon {
    width: 2.25rem;
    height: 2.25rem;
    background: var(--color-primary);
    border-radius: 0.625rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .modal-title {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
  }
  .modal-subtitle {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.35);
    margin-top: 0.125rem;
  }
  .modal-close {
    margin-left: auto;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    transition:
      background 180ms,
      color 180ms;
    flex-shrink: 0;
  }
  .modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .modal-body {
    overflow-y: auto;
    flex: 1;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }
  .modal-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .modal-section-label {
    font-size: 0.625rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .modal-product-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 0.875rem;
  }
  .modal-info-grid {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 0.875rem;
    overflow: hidden;
  }
  .modal-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .modal-info-row:last-child {
    border-bottom: none;
  }
  .modal-info-key {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.35);
  }
  .modal-info-val {
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    max-width: 60%;
    text-align: right;
    word-break: break-all;
  }
  .modal-pay-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 0.875rem;
  }
  .modal-price-list {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 0.875rem;
    overflow: hidden;
  }
  .modal-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.875rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .modal-price-row:last-child {
    border-bottom: none;
  }
  .modal-price-row.discount {
    color: #f87171;
  }
  .modal-price-row.free span:last-child {
    color: #34d399;
  }
  .modal-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.875rem;
    background: rgba(245, 197, 24, 0.06);
    border-top: 1px solid rgba(245, 197, 24, 0.15);
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
  }
  .modal-total-amount {
    font-size: 1rem;
    font-weight: 900;
    color: var(--color-primary);
  }
  .flash-badge {
    font-size: 0.625rem;
    font-weight: 800;
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    flex-shrink: 0;
  }
  .flash-badge-sm {
    font-size: 0.5625rem;
    font-weight: 800;
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    padding: 0.125rem 0.375rem;
    border-radius: 0.3rem;
  }
  .modal-warning {
    display: flex;
    gap: 0.625rem;
    padding: 0.75rem;
    background: rgba(245, 197, 24, 0.05);
    border: 1px solid rgba(245, 197, 24, 0.15);
    border-radius: 0.75rem;
    font-size: 0.6875rem;
    color: rgba(245, 197, 24, 0.6);
    line-height: 1.5;
  }
  .modal-warning strong {
    color: rgba(245, 197, 24, 0.9);
  }
  .modal-footer {
    display: flex;
    gap: 0.625rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }
  .modal-btn-cancel {
    flex: 1;
    padding: 0.75rem;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.5);
    transition: all 180ms;
  }
  .modal-btn-cancel:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
  }
  .modal-btn-cancel:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .modal-btn-confirm {
    flex: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 800;
    background: var(--color-primary);
    color: #000;
    box-shadow: 0 0 20px rgba(245, 197, 24, 0.35);
    transition: all 180ms;
  }
  .modal-btn-confirm:hover:not(:disabled) {
    background: #fcd534;
    box-shadow: 0 0 28px rgba(245, 197, 24, 0.5);
  }
  .modal-btn-confirm:disabled {
    background: rgba(245, 197, 24, 0.4);
    color: rgba(0, 0, 0, 0.5);
    cursor: not-allowed;
    box-shadow: none;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes scaleIn {
    from {
      transform: scale(0.95) translateY(8px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
</style>

