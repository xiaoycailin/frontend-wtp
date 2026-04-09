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
</script>

<div class="step-card">
  <div class="step-accent"></div>
  <div class="px-5 py-4">
    <div class="step-header">
      <div class="step-badge">3</div>
      <h3 class="step-title">Jumlah Pembelian</h3>
    </div>

    <div class="flex items-center gap-3">
      <!-- Minus -->
      <button
        onclick={() => { if (quantity > 1) quantity--; }}
        class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
               border transition-all duration-200 active:scale-90"
        style="
          background:   {quantity > 1 ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.04)'};
          border-color: {quantity > 1 ? 'rgba(245,197,24,0.4)' : 'rgba(255,255,255,0.08)'};
          color:        {quantity > 1 ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'};
        "
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
        </svg>
      </button>

      <input
        type="number"
        bind:value={quantity}
        min="1"
        max="99"
        class="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5
               text-sm font-bold text-white text-center outline-none
               focus:border-[var(--color-primary)]/60 focus:bg-white/[0.07]
               focus:shadow-[0_0_0_3px_rgba(245,197,24,0.08)]
               transition-all duration-200 [appearance:textfield]
               [&::-webkit-inner-spin-button]:appearance-none"
      />

      <!-- Plus -->
      <button
        onclick={() => { if (quantity < 99) quantity++; }}
        class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
               bg-[var(--color-primary)] text-black hover:bg-[#ffd740]
               shadow-lg shadow-yellow-500/20 transition-all duration-200 active:scale-90"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    {#if selected && quantity > 1}
      <p class="text-[10px] text-white/30 mt-2 text-center">
        {quantity}Ã— {fmt(basePrice)} =
        <span class="text-[var(--color-primary)] font-bold">{fmt(basePrice * quantity)}</span>
      </p>
    {/if}
  </div>
</div>

<style>
  .step-card {
    position: relative;
    border-radius: 1rem; overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #111111;
  }
  .step-accent {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: linear-gradient(to bottom, var(--color-primary), rgba(245, 197, 24, 0.3), transparent);
  }
  .step-header {
    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;
  }
  .step-badge {
    width: 1.75rem; height: 1.75rem; border-radius: 0.5rem;
    background: var(--color-primary);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 0.75rem; font-weight: 900; color: #000;
  }
  .step-title {
    font-size: 0.875rem; font-weight: 700;
    color: #fff; letter-spacing: 0.025em; flex: 1;
  }
</style>

