<script lang="ts">
  import type { PromoApplied } from "./types";
  import { availablePromos } from "./paymentConstants";

  let { promoApplied = $bindable<PromoApplied | null>(null) } = $props();

  let promoCode = $state("");
  let promoError = $state("");
  let showPromos = $state(false);

  function applyPromo() {
    promoError = "";
    const found = availablePromos.find(
      (p) => p.code === promoCode.trim().toUpperCase(),
    );
    if (found) {
      promoApplied = {
        code: found.code,
        desc: found.desc,
        discount: found.discount,
      };
    } else {
      promoApplied = null;
      promoError = "Kode promo tidak valid atau sudah kadaluarsa.";
    }
  }

  function removePromo() {
    promoApplied = null;
    promoCode = "";
    promoError = "";
  }

  function usePromo(code: string) {
    promoCode = code;
    showPromos = false;
    applyPromo();
  }
</script>

<div class="step-card">
  <div class="step-accent"></div>
  <div class="px-5 py-4">
    <div class="step-header">
      <div class="step-badge">4</div>
      <h3 class="step-title">Kode Promo</h3>
      {#if promoApplied}
        <span class="ml-auto text-[10px] font-bold text-emerald-400"
          >✓ {promoApplied.code} aktif</span
        >
      {/if}
    </div>

    {#if promoApplied}
      <!-- Applied state -->
      <div
        class="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-3"
      >
        <span class="text-lg">⭐</span>
        <div class="flex-1">
          <p class="text-xs font-bold text-emerald-400">{promoApplied.code}</p>
          <p class="text-[10px] text-emerald-400/60">{promoApplied.desc}</p>
        </div>
        <button
          onclick={removePromo}
          class="text-[10px] text-white/30 hover:text-red-400 px-2 py-1
                 rounded-lg border border-white/10 hover:border-red-400/30 transition-colors"
        >
          Hapus
        </button>
      </div>
    {:else}
      <!-- Input state -->
      <div class="flex gap-2 mb-3">
        <div class="relative flex-1">
          <span
            class="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            >🏷️</span
          >
          <input
            type="text"
            bind:value={promoCode}
            placeholder="Ketik Kode Promo Kamu"
            onkeydown={(e) => e.key === "Enter" && applyPromo()}
            class="w-full bg-white/[0.04] rounded-xl pl-9 pr-4 py-2.5
                   text-sm text-white placeholder-white/20 outline-none
                   transition-all duration-200 focus:bg-white/[0.07]
                   focus:shadow-[0_0_0_3px_rgba(245,197,24,0.08)] border"
            style="border-color:{promoError
              ? 'rgba(239,68,68,0.5)'
              : 'rgba(255,255,255,0.1)'};"
          />
        </div>
        <button
          onclick={applyPromo}
          disabled={!promoCode.trim()}
          class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex-shrink-0"
          style="
            background: {promoCode.trim()
            ? 'var(--color-primary)'
            : 'rgba(255,255,255,0.05)'};
            color:      {promoCode.trim() ? '#000' : 'rgba(255,255,255,0.2)'};
            box-shadow: {promoCode.trim()
            ? '0 0 16px rgba(245,197,24,0.3)'
            : 'none'};
            cursor:     {promoCode.trim() ? 'pointer' : 'not-allowed'};
          "
        >
          Gunakan
        </button>
      </div>

      {#if promoError}
        <p class="text-[11px] text-red-400 mb-3 flex items-center gap-1">
          <svg
            class="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          {promoError}
        </p>
      {/if}
    {/if}

    <!-- Toggle promo list -->
    <button
      onclick={() => (showPromos = !showPromos)}
      class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold
             border transition-all duration-200 w-full sm:w-auto"
      style="
        background:   {showPromos
        ? 'rgba(245,197,24,0.1)'
        : 'rgba(255,255,255,0.03)'};
        border-color: {showPromos
        ? 'rgba(245,197,24,0.3)'
        : 'rgba(255,255,255,0.08)'};
        color:        {showPromos
        ? 'var(--color-primary)'
        : 'rgba(255,255,255,0.5)'};
      "
    >
      <span>🎁</span> Pakai Promo Yang Tersedia
      <svg
        class="w-3 h-3 ml-auto transition-transform duration-200 {showPromos
          ? 'rotate-180'
          : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    {#if showPromos}
      <div class="mt-3 flex flex-col gap-2">
        {#each availablePromos as promo}
          <button
            onclick={() => usePromo(promo.code)}
            class="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07]
                   bg-white/[0.03] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5
                   text-left transition-all duration-200 group"
          >
            <div
              class="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0"
            >
              ⭐
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p
                  class="text-xs font-bold text-white group-hover:text-[var(--color-primary)] transition-colors"
                >
                  {promo.label}
                </p>
                <span
                  class="text-[9px] font-black px-1.5 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                >
                  {promo.code}
                </span>
              </div>
              <p class="text-[10px] text-white/35 mt-0.5">{promo.desc}</p>
            </div>
            <span
              class="text-[10px] text-[var(--color-primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Pakai →
            </span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .step-card {
    position: relative;
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #111111;
  }
  .step-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(
      to bottom,
      var(--color-primary),
      rgba(245, 197, 24, 0.3),
      transparent
    );
  }
  .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .step-badge {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 900;
    color: #000;
  }
  .step-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.025em;
    flex: 1;
  }
</style>
