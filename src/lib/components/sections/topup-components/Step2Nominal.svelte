<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import ParticleCanvas from "../../ParticleCanvas.svelte";
  import type { Product, TabKey } from "./types";
  import { fmt } from "./utils";

  let { products, selected = $bindable<Product | null>(null) } = $props();

  let activeTab = $state<TabKey>("flash");
  let flashSale = $state<Product[]>([]);
  let diamonds = $state<Product[]>([]);
  let specialItems = $state<Product[]>([]);

  const allTabs: { key: TabKey; label: string }[] = [
    { key: "flash", label: "⚡ Flash Sale" },
    { key: "special", label: "🔥 Special Items" },
    { key: "diamond", label: "💎 Topup Instant" },
  ];

  const tabDataMap: Record<TabKey, () => unknown[]> = {
    flash: () => flashSale,
    special: () => specialItems,
    diamond: () => diamonds,
  };

  // tabs yang tampil = hanya yang punya data
  const tabs = $derived(allTabs.filter((t) => tabDataMap[t.key]().length > 0));

  onMount(() => {
    diamonds = [];
    flashSale = [];
    specialItems = [];

    products.forEach((p: any) => {
      // flash sale items (turunan dari product)
      if (p.flashSales && p.flashSales.length > 0) {
        p.flashSales.forEach((f: any) => {
          const price = Number(p.price);
          const discount = Number(f.discount);
          const discountValue =
            f.discType === "percent" ? (price * discount) / 100 : discount;
          const finalPrice = price - discountValue;

          flashSale.push({
            label: p.title,
            icon: p.thumbnails,
            id: f.id,
            productFlashId: p.id,
            price: finalPrice,
            originalPrice: price,
            instant: p.instant,
            tag:
              f.discType === "percent"
                ? `Potongan ${discount}%`
                : `Potongan ${fmt(discount)}`,
            stock: f.sellCount,
            maxStock: f.stock,
          });
        });
      }

      // special vs diamond
      if (p.isSpecial) {
        specialItems.push({
          id: p.id,
          label: p.title,
          price: p.price,
          icon: p.thumbnails,
          instant: p.instant,
        });
      } else {
        diamonds.push({
          id: p.id,
          label: p.title,
          price: p.price,
          icon: p.thumbnails,
          instant: p.instant,
        });
      }
    });

    // PINDAH KE SINI: setelah forEach, baru cek tab pertama yang ada data
    // juga override query param jika productId ditemukan
    const searchParams = $page.url.searchParams;
    const productId = searchParams.get("productId");

    if (productId) {
      let found = flashSale.find((f) => String(f.id) === productId);
      if (found) {
        activeTab = "flash";
        selected = found;
        return;
      }

      found = specialItems.find((s) => String(s.id) === productId);
      if (found) {
        activeTab = "special";
        selected = found;
        return;
      }

      found = diamonds.find((d) => String(d.id) === productId);
      if (found) {
        activeTab = "diamond";
        selected = found;
        return;
      }
    }

    // fallback: tab pertama yang punya data
    const firstAvailable = allTabs.find((t) => tabDataMap[t.key]().length > 0);
    if (firstAvailable) activeTab = firstAvailable.key;
  });

  function toggleSelect(p: Product) {
    selected = selected?.id === p.id ? null : p;
  }

  const stockPct = (p: Product) =>
    p.maxStock ? Math.round((p.stock! / p.maxStock) * 100) : 0;
</script>

<div class="step-card">
  <div class="step-accent"></div>
  <div class="px-5 py-4">
    <div class="step-header">
      <div class="step-badge">2</div>
      <h3 class="step-title">Pilih Nominal</h3>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
      {#each tabs as tab}
        <button
          on:click={() => (activeTab = tab.key)}
          class="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl
                 text-xs font-bold border transition-all duration-200 whitespace-nowrap"
          style="
            background:   {activeTab === tab.key
            ? 'rgba(245,197,24,0.12)'
            : 'rgba(255,255,255,0.03)'};
            border-color: {activeTab === tab.key
            ? 'rgba(245,197,24,0.5)'
            : 'rgba(255,255,255,0.07)'};
            color:        {activeTab === tab.key
            ? 'var(--color-primary)'
            : 'rgba(255,255,255,0.4)'};
            box-shadow:   {activeTab === tab.key
            ? '0 0 16px rgba(245,197,24,0.15)'
            : 'none'};
          "
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <!-- Flash Sale -->
    {#if activeTab === "flash"}
      <div
        class="relative rounded-xl overflow-hidden border border-[var(--color-primary)]/30 bg-[#0d0d0d] p-4"
      >
        <div class="absolute inset-0 overflow-hidden rounded-xl">
          <ParticleCanvas
            maxParticles={30}
            colors={["var(--color-primary)bb", "#ff6b3566", "#ffffff44"]}
            lineColor="var(--color-primary)"
            lineDistance={70}
            opacity={0.5}
            blendMode="screen"
          />
        </div>

        <div class="relative z-10 flex items-center gap-2 mb-4">
          <div
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-primary)] shadow-lg shadow-yellow-500/30"
          >
            <span class="text-sm">⚡</span>
            <span class="text-black text-xs font-black tracking-widest"
              >FLASH SALE</span
            >
          </div>
        </div>

        <div class="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {#each flashSale as p}
            {@const pct = stockPct(p)}
            {@const isSelected = selected?.id === p.id}
            <button
              on:click={() => toggleSelect(p)}
              class="product-card"
              style="
                background:   {isSelected
                ? 'rgba(245,197,24,0.1)'
                : 'rgba(255,255,255,0.03)'};
                border-color: {isSelected
                ? 'var(--color-primary)'
                : 'rgba(255,255,255,0.08)'};
                box-shadow:   {isSelected
                ? '0 0 20px rgba(245,197,24,0.2)'
                : 'none'};
              "
            >
              {#if isSelected}
                <div class="check-badge">
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

              <div class="p-3">
                <div class="flex items-center gap-2 mb-2">
                  <img src={p.icon} width="25" alt="" />
                  <div>
                    <p class="text-[11px] font-bold text-white leading-tight">
                      {p.label}
                    </p>
                    {#if p.sublabel}
                      <p class="text-[9px] text-white/35">
                        {p.sublabel}
                      </p>
                    {/if}
                  </div>
                </div>
                <p class="text-base font-black text-[var(--color-primary)]">
                  {fmt(p.price)}
                </p>
                {#if p.originalPrice}
                  <p class="text-[9px] text-white/30 line-through">
                    {fmt(p.originalPrice)}
                  </p>
                {/if}
              </div>

              <div class="px-3 pb-2">
                <div
                  class="h-1 w-full bg-white/10 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    style="width:{pct}%; background:{pct > 50
                      ? 'var(--color-primary)'
                      : pct > 20
                        ? '#ff6b35'
                        : '#ef4444'};"
                  ></div>
                </div>
                <p class="text-[9px] text-white/30 mt-1">
                  {p.stock}/{p.maxStock} terjual
                </p>
              </div>

              <div
                class="flex items-center gap-1.5 px-3 py-2 border-t border-white/[0.06]"
              >
                {#if p.tag}
                  <span
                    class="text-[9px] font-black px-1.5 py-0.5 rounded bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                    >{p.tag}</span
                  >
                {/if}
                {#if p.instant}
                  <span
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 ml-auto"
                    >⚡ Instan</span
                  >
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>
    {:else if activeTab === "special"}
      <!-- Special Items -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each specialItems as p}
          {@const isSelected = selected?.id === p.id}
          <button
            on:click={() => toggleSelect(p)}
            class="group flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200"
            style="
              background:   {isSelected
              ? 'rgba(245,197,24,0.08)'
              : 'rgba(255,255,255,0.03)'};
              border-color: {isSelected
              ? 'var(--color-primary)'
              : 'rgba(255,255,255,0.07)'};
              box-shadow:   {isSelected
              ? '0 0 16px rgba(245,197,24,0.15)'
              : 'none'};
            "
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
              style="background:{isSelected
                ? 'rgba(245,197,24,0.15)'
                : 'rgba(255,255,255,0.05)'};"
            >
              <img src={p.icon} width="25" alt="" />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-xs font-bold text-white truncate group-hover:text-[var(--color-primary)] transition-colors"
              >
                {p.label}
              </p>
              <p class="text-sm font-black text-[var(--color-primary)] mt-0.5">
                {fmt(p.price)}
              </p>
            </div>
            {#if isSelected}
              <div class="check-badge-sm">
                <svg
                  class="w-3 h-3 text-black"
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
    {:else}
      <!-- Diamonds -->
      <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {#each diamonds as p}
          {@const isSelected = selected?.id === p.id}
          <button
            on:click={() => toggleSelect(p)}
            class="relative flex flex-col items-center gap-1.5 p-3 rounded-xl border
                   transition-all duration-200 text-center"
            style="
              background:   {isSelected
              ? 'rgba(245,197,24,0.08)'
              : 'rgba(255,255,255,0.03)'};
              border-color: {isSelected
              ? 'var(--color-primary)'
              : 'rgba(255,255,255,0.07)'};
              box-shadow:   {isSelected
              ? '0 0 16px rgba(245,197,24,0.15)'
              : 'none'};
            "
          >
            {#if isSelected}
              <div class="check-badge">
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
            <img src={p.icon} width="30" alt="" />
            <p class="text-[11px] font-bold text-white leading-tight">
              {p.label}
            </p>
            {#if p.sublabel}
              <p class="text-[9px] text-emerald-400/80">{p.sublabel}</p>
            {/if}
            <p class="text-xs font-black text-[var(--color-primary)] mt-0.5">
              {fmt(p.price)}
            </p>
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
  .product-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 0.75rem;
    border: 1px solid;
    text-align: left;
    transition: all 0.2s;
    overflow: hidden;
  }
  .check-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 10;
    width: 1rem;
    height: 1rem;
    border-radius: 9999px;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .check-badge-sm {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 9999px;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>
