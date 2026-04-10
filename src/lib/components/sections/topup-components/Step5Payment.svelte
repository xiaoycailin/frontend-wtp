<script lang="ts">
  import type { Product, PaymentMethod } from "./types";
  import { directMethods } from "./paymentConstants";
  import { fmt } from "./utils";
  import { onMount } from "svelte";

  // â”€â”€ Props (hanya yang benar-benar dari parent) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let {
    selectedPay = $bindable(null),
    basePrice,
    selected,
  }: {
    selectedPay: any;
    basePrice: number;
    selected: Product | null;
  } = $props();

  // â”€â”€ Local state (HARUS $state agar reaktif) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let paymentQris = $state<PaymentMethod[]>([]);
  let paymentEwallet = $state<PaymentMethod[]>([]);
  let paymentVa = $state<PaymentMethod[]>([]);
  let prices = $state<any[]>([]);

  let qrisGroupOpen = $state(false);
  let ewalletOpen = $state(false);
  let vaOpen = $state(false);
  let getPricesLoading = $state(false);

  // â”€â”€ Fetch payment methods saat mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  onMount(async () => {
    try {
      const res = await fetch("/api/v1/payments/available");
      if (!res.ok) return;

      const paymentMethods: any[] = (await res.json()).data;

      // Reset dulu sebelum push
      paymentQris = [];
      paymentVa = [];
      paymentEwallet = [];

      paymentMethods
        .filter((p) => p.paymentVisibility === "active")
        .forEach((p) => {
          const method: PaymentMethod = {
            id: p.id,
            name: p.paymentName,
            autoCheck: true,
            logo: p.thumbnail,
          };

          if (p.group === "qris") paymentQris = [...paymentQris, method];
          else if (p.group === "va") paymentVa = [...paymentVa, method];
          else if (p.group === "ewallet")
            paymentEwallet = [...paymentEwallet, method];
        });
    } catch (err) {
      console.error("Gagal fetch payment methods:", err);
    }
  });

  // â”€â”€ Fetch harga tiap kali selected berubah â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // FIX: pakai AbortController supaya tidak race condition
  $effect(() => {
    if (!selected) {
      prices = []; // reset harga kalau produk di-deselect
      return;
    }

    const controller = new AbortController();

    fetchPrices(
      selected.productFlashId || selected.id,
      selected.productFlashId ? selected.id : null,
      controller.signal,
    );

    // Cleanup: batalkan request lama kalau selected ganti lagi
    return () => controller.abort();
  });

  async function fetchPrices(
    itemId: string,
    flashId: any,
    signal?: AbortSignal,
  ) {
    getPricesLoading = true;
    try {
      const res = await fetch("/api/v1/payments/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          qty: 1,
          ...(flashId ? { flashId } : {}),
        }),
        signal,
      });

      if (!res.ok) return;

      const data = await res.json();
      // FIX: backend reply.send(prices) → response langsung array
      // Kalau backend kamu wrap dengan { data: [...] }, ganti ke data.data
      prices = Array.isArray(data) ? data : (data.data ?? []);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Gagal fetch harga:", err);
      }
    } finally {
      getPricesLoading = false;
    }
  }

  // â”€â”€ Helper ambil harga per metode pembayaran â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function methodPrice(m: PaymentMethod): number {
    const found = prices?.find((p) => p.id === m.id);
    return found?.total_price ?? basePrice;
  }
</script>

<!-- â”€â”€ Template (tidak berubah banyak, + loading state) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
<div class="step-card">
  <div class="step-accent"></div>
  <div class="px-5 py-4">
    <div class="step-header">
      <div class="step-badge">5</div>
      <h3 class="step-title">Pilih Pembayaran</h3>
      <!-- Loading indicator -->
      {#if getPricesLoading}
        <span class="ml-auto text-[10px] text-white/30 flex items-center gap-1">
          <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
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
          Memuat harga...
        </span>
      {/if}
    </div>

    <!-- Direct methods (Coinpedia, dll) -->
    <div class="flex flex-col gap-2 mb-3">
      {#each directMethods as m}
        {@const isSelected = selectedPay.id === m.id}
        <button
          onclick={() => (selectedPay = m)}
          class="relative flex items-center gap-4 p-3.5 rounded-xl border
                 text-left transition-all duration-200 overflow-hidden"
          style="
            background:   {isSelected
            ? 'rgba(245,197,24,0.07)'
            : 'rgba(255,255,255,0.03)'};
            border-color: {isSelected
            ? 'var(--color-primary)'
            : 'rgba(255,255,255,0.08)'};
            box-shadow:   {isSelected
            ? '0 0 20px rgba(245,197,24,0.15)'
            : 'none'};
          "
        >
          <div
            class="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
            style="border-color:{isSelected
              ? 'var(--color-primary)'
              : 'rgba(255,255,255,0.2)'};"
          >
            {#if isSelected}<div
                class="w-2 h-2 rounded-full bg-[var(--color-primary)]"
              ></div>{/if}
          </div>
          {#if m.logo}
            <img src={m.logo} alt={m.name} class="h-6 object-contain" />
          {/if}
          <div class="flex-1">
            <p class="text-xs font-bold text-white">{m.name}</p>
            {#if m.note}<p class="text-[10px] text-red-400/70 mt-0.5">
                {m.note}
              </p>{/if}
          </div>
          <!-- FIX: skeleton saat loading -->
          {#if selected}
            {#if getPricesLoading}
              <div class="h-4 w-20 rounded bg-white/10 animate-pulse"></div>
            {:else}
              <p class="text-sm font-black text-white">{fmt(methodPrice(m))}</p>
            {/if}
          {/if}
          {#if m.tag}
            <div class="absolute top-0 right-0 overflow-hidden w-16 h-16">
              <div
                class="absolute top-3 right-[-18px] w-20 py-0.5 text-center rotate-45 text-[8px] font-black"
                style="background:var(--color-primary);color:#000;"
              >
                {m.tag}
              </div>
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- QRIS accordion -->
    <div class="rounded-xl border border-white/[0.07] overflow-hidden mb-2">
      <button
        onclick={() => (qrisGroupOpen = !qrisGroupOpen)}
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-white">QRIS (All Payment)</span>
          <span
            class="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/[0.05]"
          >
            {paymentQris.length} pilihan
          </span>
        </div>
        <svg
          class="w-4 h-4 text-white/40 transition-transform duration-300 {qrisGroupOpen
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
      {#if qrisGroupOpen}
        <div
          class="px-3 pb-3 pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-white/[0.05]"
        >
          {#each paymentQris as m}
            {@const isSelected = selectedPay.id === m.id}
            <button
              onclick={() => (selectedPay = m)}
              class="relative flex flex-col gap-2 p-3 rounded-xl border text-left transition-all duration-200"
              style="
                background:   {isSelected
                ? 'rgba(245,197,24,0.07)'
                : 'rgba(255,255,255,0.03)'};
                border-color: {isSelected
                ? 'var(--color-primary)'
                : 'rgba(255,255,255,0.07)'};
                box-shadow:   {isSelected
                ? '0 0 14px rgba(245,197,24,0.15)'
                : 'none'};
              "
            >
              {#if m.logo}
                <img
                  src={m.logo}
                  alt={m.name}
                  class="h-7 object-contain object-left"
                />
              {:else}
                <span class="text-xs font-bold text-white">{m.name}</span>
              {/if}
              <div>
                {#if selected}
                  {#if getPricesLoading}
                    <div
                      class="h-3.5 w-16 rounded bg-white/10 animate-pulse"
                    ></div>
                  {:else}
                    <p class="text-xs font-black text-white">
                      {fmt(methodPrice(m))}
                    </p>
                  {/if}
                {/if}
                {#if m.autoCheck}
                  <p class="text-[9px] text-emerald-400/70">Dicek Otomatis</p>
                {/if}
              </div>
              {#if isSelected}
                <div
                  class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                >
                  <svg
                    class="w-2.5 h-2.5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- E-Wallet accordion -->
    <div class="rounded-xl border border-white/[0.07] overflow-hidden mb-2">
      <button
        onclick={() => (ewalletOpen = !ewalletOpen)}
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div class="flex items-center gap-2">
          <span>ðŸ“±</span>
          <span class="text-sm font-bold text-white">E-Wallet</span>
          <span
            class="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/[0.05]"
          >
            {paymentEwallet.length} pilihan
          </span>
        </div>
        <svg
          class="w-4 h-4 text-white/40 transition-transform duration-300 {ewalletOpen
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
      {#if ewalletOpen}
        <div
          class="px-3 pb-3 pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-white/[0.05]"
        >
          {#each paymentEwallet as m}
            {@const isSelected = selectedPay.id === m.id}
            <button
              onclick={() => (selectedPay = m)}
              class="relative flex flex-col gap-2 p-3 rounded-xl border text-left transition-all duration-200"
              style="
                background:   {isSelected
                ? 'rgba(245,197,24,0.07)'
                : 'rgba(255,255,255,0.03)'};
                border-color: {isSelected
                ? 'var(--color-primary)'
                : 'rgba(255,255,255,0.07)'};
                box-shadow:   {isSelected
                ? '0 0 14px rgba(245,197,24,0.15)'
                : 'none'};
              "
            >
              {#if m.logo}
                <img
                  src={m.logo}
                  alt={m.name}
                  class="h-5 object-contain object-left"
                />
              {:else}
                <span class="text-xs font-bold text-white">{m.name}</span>
              {/if}
              <div>
                {#if selected}
                  {#if getPricesLoading}
                    <div
                      class="h-3.5 w-16 rounded bg-white/10 animate-pulse"
                    ></div>
                  {:else}
                    <p class="text-xs font-black text-white">
                      {fmt(methodPrice(m))}
                    </p>
                  {/if}
                {/if}
                {#if m.autoCheck}
                  <p class="text-[9px] text-emerald-400/70">Dicek Otomatis</p>
                {/if}
              </div>
              {#if isSelected}
                <div
                  class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                >
                  <svg
                    class="w-2.5 h-2.5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Virtual Account accordion -->
    <div class="rounded-xl border border-white/[0.07] overflow-hidden">
      <button
        onclick={() => (vaOpen = !vaOpen)}
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-white">Virtual Account</span>
          <span
            class="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/[0.05]"
          >
            {paymentVa.length} pilihan
          </span>
        </div>
        <svg
          class="w-4 h-4 text-white/40 transition-transform duration-300 {vaOpen
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
      {#if vaOpen}
        <div
          class="px-3 pb-3 pt-2 flex flex-col gap-2 border-t border-white/[0.05]"
        >
          {#each paymentVa as m}
            {@const isSelected = selectedPay.id === m.id}
            <button
              onclick={() => (selectedPay = m)}
              class="relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200"
              style="
                background:   {isSelected
                ? 'rgba(245,197,24,0.07)'
                : 'rgba(255,255,255,0.03)'};
                border-color: {isSelected
                ? 'var(--color-primary)'
                : 'rgba(255,255,255,0.07)'};
              "
            >
              <div
                class="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                style="border-color:{isSelected
                  ? 'var(--color-primary)'
                  : 'rgba(255,255,255,0.2)'};"
              >
                {#if isSelected}<div
                    class="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                  ></div>{/if}
              </div>
              {#if m.logo}
                <img
                  src={m.logo}
                  alt={m.name}
                  class="h-5 object-contain flex-shrink-0"
                />
              {/if}
              <span class="text-xs font-bold text-white flex-1">{m.name}</span>
              {#if selected}
                {#if getPricesLoading}
                  <div
                    class="h-3.5 w-16 rounded bg-white/10 animate-pulse"
                  ></div>
                {:else}
                  <span class="text-xs font-black text-white/80"
                    >{fmt(methodPrice(m))}</span
                  >
                {/if}
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
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
