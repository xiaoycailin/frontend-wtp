<script lang="ts">
  import type { Product } from "./types";
  import { fmt } from "./utils";

  let {
    quantity = $bindable(1),
    selected,
    basePrice,
  }: {
    quantity: number;
    selected: Product | null;
    basePrice: number;
  } = $props();

  function decrement() {
    if (quantity > 1) quantity--;
  }
  function increment() {
    if (quantity < 99) quantity++;
  }
  function handleInput(e: Event) {
    const v = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(v)) quantity = Math.min(99, Math.max(1, v));
  }

  const quickPicks = [1, 2, 3, 5, 10];
  let totalPrice = $derived(basePrice * quantity);
  let showMultiplier = $derived(selected && quantity > 1);
</script>

<div class="step-card">
  <div class="step-accent" aria-hidden="true"></div>

  <div class="card-inner">
    <!-- Header -->
    <div class="step-header">
      <div class="step-badge"><span>3</span></div>
      <div>
        <h3 class="step-title">Jumlah Pembelian</h3>
        <p class="step-subtitle">Maksimal 99 item per transaksi</p>
      </div>
    </div>

    <!-- Counter row -->
    <div class="counter-row">
      <!-- Minus button -->
      <button
        type="button"
        onclick={decrement}
        disabled={quantity <= 1}
        class="counter-btn counter-minus"
        aria-label="Kurangi jumlah"
      >
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
            d="M20 12H4"
          />
        </svg>
      </button>

      <!-- Input -->
      <div class="counter-input-wrap">
        <input
          type="number"
          value={quantity}
          oninput={handleInput}
          min="1"
          max="99"
          class="counter-input"
          aria-label="Jumlah pembelian"
        />
        <span class="counter-unit">item</span>
      </div>

      <!-- Plus button -->
      <button
        type="button"
        onclick={increment}
        disabled={quantity >= 99}
        class="counter-btn counter-plus"
        aria-label="Tambah jumlah"
      >
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>

    <!-- Quick pick chips -->
    <div class="quick-row">
      <span class="quick-label">Cepat pilih:</span>
      <div class="quick-chips">
        {#each quickPicks as q}
          <button
            type="button"
            class="quick-chip"
            class:quick-active={quantity === q}
            onclick={() => (quantity = q)}
          >
            {q}×
          </button>
        {/each}
      </div>
    </div>

    <!-- Price preview -->
    {#if showMultiplier}
      <div class="price-preview">
        <div class="price-formula">
          <span class="formula-qty">{quantity}×</span>
          <span class="formula-base">{fmt(basePrice)}</span>
        </div>
        <div class="formula-equals">
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
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
        <div class="formula-total">{fmt(totalPrice)}</div>
      </div>
    {/if}
  </div>
</div>

<style>
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
    gap: 1rem;
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

  /* ── Counter row ── */
  .counter-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .counter-btn {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.875rem;
    border: 1px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .counter-btn:active:not(:disabled) {
    transform: scale(0.91);
  }
  .counter-btn:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }

  .counter-minus {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.09);
    color: rgba(255, 255, 255, 0.5);
  }
  .counter-minus:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
    color: #fff;
  }

  .counter-plus {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #000;
    box-shadow: 0 4px 16px rgba(245, 197, 24, 0.3);
  }
  .counter-plus:hover:not(:disabled) {
    filter: brightness(1.1);
    box-shadow: 0 6px 22px rgba(245, 197, 24, 0.4);
    transform: translateY(-1px);
  }

  /* ── Input ── */
  .counter-input-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }
  .counter-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.875rem;
    padding: 0.6875rem 2.5rem 0.6875rem 1rem;
    font-size: 1.125rem;
    font-weight: 900;
    color: #fff;
    text-align: center;
    outline: none;
    appearance: textfield;
    -moz-appearance: textfield;
    transition: all 0.2s ease;
    caret-color: var(--color-primary);
  }
  .counter-input::-webkit-inner-spin-button,
  .counter-input::-webkit-outer-spin-button {
    appearance: none;
  }
  .counter-input:focus {
    border-color: rgba(245, 197, 24, 0.5);
    background: rgba(245, 197, 24, 0.04);
    box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.08);
  }
  .counter-unit {
    position: absolute;
    right: 0.875rem;
    font-size: 0.6rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.25);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    pointer-events: none;
  }

  /* ── Quick picks ── */
  .quick-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
  }
  .quick-label {
    font-size: 0.625rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.25);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
  .quick-chips {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
  }
  .quick-chip {
    padding: 0.25rem 0.625rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.6875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.16s ease;
    font-variant-numeric: tabular-nums;
  }
  .quick-chip:hover:not(.quick-active) {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }
  .quick-active {
    background: rgba(245, 197, 24, 0.12);
    border-color: rgba(245, 197, 24, 0.4);
    color: var(--color-primary);
    box-shadow: 0 0 10px rgba(245, 197, 24, 0.1);
  }

  /* ── Price preview ── */
  .price-preview {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    background: rgba(245, 197, 24, 0.05);
    border: 1px solid rgba(245, 197, 24, 0.12);
  }
  .price-formula {
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
    flex: 1;
  }
  .formula-qty {
    font-size: 1rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.9);
    font-variant-numeric: tabular-nums;
  }
  .formula-base {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.35);
    font-variant-numeric: tabular-nums;
  }
  .formula-equals {
    color: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .formula-total {
    font-size: 1.0625rem;
    font-weight: 900;
    color: var(--color-primary);
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 20px rgba(245, 197, 24, 0.4);
  }
</style>
