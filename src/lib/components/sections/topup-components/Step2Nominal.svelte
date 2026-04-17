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
  let mounted = $state(false);
  let hoveredId = $state<string | number | null>(null);

  const allTabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "flash", label: "Flash Sale", icon: "⚡" },
    { key: "special", label: "Special Items", icon: "🔥" },
    { key: "diamond", label: "Topup Instant", icon: "💎" },
  ];

  const tabDataMap: Record<TabKey, () => unknown[]> = {
    flash: () => flashSale,
    special: () => specialItems,
    diamond: () => diamonds,
  };

  const tabs = $derived(allTabs.filter((t) => tabDataMap[t.key]().length > 0));

  onMount(() => {
    diamonds = [];
    flashSale = [];
    specialItems = [];

    products.forEach((p: any) => {
      if (p.flashSales?.length > 0) {
        p.flashSales.forEach((f: any) => {
          const price = Number(p.price);
          const discount = Number(f.discount);
          const discountValue =
            f.discType === "percent" ? (price * discount) / 100 : discount;
          flashSale.push({
            label: p.title,
            icon: p.thumbnails,
            id: f.id,
            productFlashId: p.id,
            price: price - discountValue,
            originalPrice: price,
            instant: p.instant,
            tag:
              f.discType === "percent" ? `−${discount}%` : `−${fmt(discount)}`,
            stock: f.sellCount,
            maxStock: f.stock,
          });
        });
      }
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

    const productId = $page.url.searchParams.get("productId");
    if (productId) {
      let found: Product | undefined;

      found = flashSale.find((f) => String(f.id) === productId);
      if (found) {
        activeTab = "flash";
        selected = found;
      }

      if (!found) {
        found = specialItems.find((s) => String(s.id) === productId);
        if (found) {
          activeTab = "special";
          selected = found;
        }
      }

      if (!found) {
        found = diamonds.find((d) => String(d.id) === productId);
        if (found) {
          activeTab = "diamond";
          selected = found;
        }
      }

      // Tidak perlu return — lanjut ke bawah
    }

    if (!$page.url.searchParams.get("productId")) {
      const firstAvailable = allTabs.find(
        (t) => tabDataMap[t.key]().length > 0,
      );
      if (firstAvailable) activeTab = firstAvailable.key;
    }

    setTimeout(() => (mounted = true), 60); // ← Selalu jalan
  });

  function toggleSelect(p: Product) {
    selected = selected?.id === p.id ? null : p;
  }

  const stockPct = (p: Product) =>
    p.maxStock ? Math.round((p.stock! / p.maxStock) * 100) : 0;

  function stockLabel(pct: number) {
    if (pct > 70) return { text: "Hampir habis", color: "#ef4444" };
    if (pct > 40) return { text: "Terbatas", color: "#f97316" };
    return { text: "Tersedia", color: "var(--color-primary)" };
  }
</script>

<div class="step-card" class:mounted>
  <!-- Left accent bar -->
  <div class="step-accent" aria-hidden="true"></div>

  <div class="card-inner">
    <!-- ── Header ── -->
    <div class="step-header">
      <div class="step-badge">
        <span>2</span>
      </div>
      <div>
        <h3 class="step-title">Pilih Nominal</h3>
        <p class="step-subtitle">Pilih paket yang sesuai kebutuhanmu</p>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="tabs-wrap" role="tablist" aria-label="Kategori produk">
      {#each tabs as tab}
        {@const isActive = activeTab === tab.key}
        <button
          role="tab"
          aria-selected={isActive}
          class="tab-btn"
          class:tab-active={isActive}
          onclick={() => (activeTab = tab.key)}
        >
          <span class="tab-icon">{tab.icon}</span>
          <span class="tab-label">{tab.label}</span>
          {#if isActive}
            <span class="tab-count">{tabDataMap[tab.key]().length}</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- ── Panel: Flash Sale ── -->
    {#if activeTab === "flash"}
      <div class="flash-panel" role="tabpanel">
        <!-- Flash header -->
        <div class="flash-header">
          <div class="absolute inset-0 overflow-hidden rounded-2xl">
            <ParticleCanvas
              maxParticles={25}
              colors={[
                "rgba(245,197,24,0.6)",
                "rgba(255,107,53,0.4)",
                "rgba(255,255,255,0.2)",
              ]}
              lineColor="rgba(245,197,24,0.3)"
              lineDistance={65}
              opacity={0.6}
              blendMode="screen"
            />
          </div>
          <div class="flash-header-content">
            <div class="flash-badge">
              <span class="flash-pulse"></span>
              <span>LIVE</span>
              <span class="flash-divider"></span>
              <span>⚡ FLASH SALE</span>
            </div>
            <p class="flash-sub">Penawaran terbatas · Harga terendah</p>
          </div>
        </div>

        <!-- Flash cards -->
        <div class="flash-grid">
          {#each flashSale as p}
            {@const pct = stockPct(p)}
            {@const sl = stockLabel(pct)}
            {@const isSelected = selected?.id === p.id}
            {@const isHovered = hoveredId === p.id}
            <button
              class="flash-card"
              class:flash-selected={isSelected}
              onclick={() => toggleSelect(p)}
              onmouseenter={() => (hoveredId = p.id)}
              onmouseleave={() => (hoveredId = null)}
              aria-pressed={isSelected}
            >
              <!-- Selection ring -->
              {#if isSelected}
                <div class="sel-ring" aria-hidden="true"></div>
              {/if}

              <!-- Check mark -->
              {#if isSelected}
                <div class="check-mark" aria-label="Terpilih">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    width="10"
                    height="10"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              {/if}

              <!-- Discount ribbon -->
              {#if p.tag}
                <div class="flash-ribbon">{p.tag}</div>
              {/if}

              <!-- Card body -->
              <div class="flash-card-body">
                <div class="flash-img-wrap">
                  <img
                    src={p.icon}
                    width="32"
                    height="32"
                    loading="lazy"
                    alt={p.label}
                  />
                  {#if p.instant}
                    <span class="instant-dot" title="Instan"></span>
                  {/if}
                </div>
                <p class="flash-label">{p.label}</p>
                <div class="flash-prices">
                  <span class="flash-price">{fmt(p.price)}</span>
                  {#if p.originalPrice}
                    <span class="flash-orig">{fmt(p.originalPrice)}</span>
                  {/if}
                </div>
              </div>

              <!-- Stock bar -->
              <div class="flash-stock">
                <div class="stock-bar-wrap">
                  <div
                    class="stock-bar-fill"
                    style="width:{pct}%; background:{sl.color};"
                  ></div>
                </div>
                <div class="stock-meta">
                  <span style="color:{sl.color};" class="stock-label"
                    >{sl.text}</span
                  >
                  <span class="stock-nums">{p.stock}/{p.maxStock}</span>
                </div>
              </div>

              {#if p.instant}
                <div class="flash-footer">
                  <span class="instant-badge">⚡ Instan</span>
                </div>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- ── Panel: Special Items ── -->
    {:else if activeTab === "special"}
      <div class="special-grid" role="tabpanel">
        {#each specialItems as p}
          {@const isSelected = selected?.id === p.id}
          <button
            class="special-card"
            class:special-selected={isSelected}
            onclick={() => toggleSelect(p)}
            onmouseenter={() => (hoveredId = p.id)}
            onmouseleave={() => (hoveredId = null)}
            aria-pressed={isSelected}
          >
            {#if isSelected}
              <div class="sel-ring" aria-hidden="true"></div>
            {/if}

            <div
              class="special-icon-wrap"
              class:special-icon-active={isSelected}
            >
              <img
                src={p.icon}
                width="28"
                height="28"
                loading="lazy"
                alt={p.label}
              />
            </div>

            <div class="special-info">
              <p class="special-label">{p.label}</p>
              <p class="special-price">{fmt(p.price)}</p>
              {#if p.instant}
                <span class="special-instant">⚡ Instan</span>
              {/if}
            </div>

            <div class="special-check" class:special-check-active={isSelected}>
              {#if isSelected}
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              {/if}
            </div>
          </button>
        {/each}
      </div>

      <!-- ── Panel: Diamonds ── -->
    {:else}
      <div class="diamond-grid" role="tabpanel">
        {#each diamonds as p}
          {@const isSelected = selected?.id === p.id}
          <button
            class="diamond-card"
            class:diamond-selected={isSelected}
            onclick={() => toggleSelect(p)}
            onmouseenter={() => (hoveredId = p.id)}
            onmouseleave={() => (hoveredId = null)}
            aria-pressed={isSelected}
          >
            {#if isSelected}
              <div class="check-mark" aria-label="Terpilih">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="10"
                  height="10"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            {/if}

            <div class="diamond-img-wrap" class:diamond-img-active={isSelected}>
              <img
                src={p.icon}
                width="34"
                height="34"
                loading="lazy"
                alt={p.label}
              />
            </div>

            <p class="diamond-label">{p.label}</p>
            {#if p.sublabel}
              <p class="diamond-sub">{p.sublabel}</p>
            {/if}
            <p class="diamond-price">{fmt(p.price)}</p>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  /* ── Card shell ── */
  .step-card {
    position: relative;
    border-radius: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #0f0f0f;
    overflow: hidden;
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 0.35s ease,
      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .step-card.mounted {
    opacity: 1;
    transform: translateY(0);
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
      rgba(245, 197, 24, 0.3) 60%,
      transparent
    );
    z-index: 1;
  }

  .card-inner {
    padding: 1.25rem 1.25rem 1.5rem 1.5rem;
  }

  /* ── Header ── */
  .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
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
    box-shadow: 0 0 16px rgba(245, 197, 24, 0.35);
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

  /* ── Tabs ── */
  .tabs-wrap {
    display: flex;
    gap: 0.375rem;
    margin-bottom: 1.25rem;
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding-bottom: 2px;
  }
  .tabs-wrap::-webkit-scrollbar {
    display: none;
  }

  .tab-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4375rem 0.875rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
  }
  .tab-btn:hover:not(.tab-active) {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.7);
    border-color: rgba(255, 255, 255, 0.12);
  }
  .tab-active {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.4);
    color: var(--color-primary);
    box-shadow:
      0 0 18px rgba(245, 197, 24, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  .tab-icon {
    font-size: 0.875rem;
    line-height: 1;
  }
  .tab-label {
    line-height: 1;
  }
  .tab-count {
    background: rgba(245, 197, 24, 0.2);
    color: var(--color-primary);
    font-size: 0.625rem;
    font-weight: 900;
    padding: 0.1rem 0.35rem;
    border-radius: 9999px;
    line-height: 1.4;
    min-width: 1.25rem;
    text-align: center;
  }

  /* ── Shared: selection ring ── */
  .sel-ring {
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    border: 1.5px solid var(--color-primary);
    pointer-events: none;
    z-index: 3;
    box-shadow:
      0 0 18px rgba(245, 197, 24, 0.2),
      inset 0 0 12px rgba(245, 197, 24, 0.04);
  }

  /* ── Shared: check mark ── */
  .check-mark {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 10;
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 50%;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(245, 197, 24, 0.45);
    color: #000;
  }

  /* ─────────────────────────────────────
     FLASH SALE panel
  ───────────────────────────────────── */
  .flash-panel {
  }

  .flash-header {
    position: relative;
    background: linear-gradient(
      135deg,
      rgba(245, 197, 24, 0.1),
      rgba(255, 107, 53, 0.06),
      rgba(245, 197, 24, 0.04)
    );
    border: 1px solid rgba(245, 197, 24, 0.18);
    border-radius: 1rem;
    padding: 1rem 1.125rem;
    margin-bottom: 1rem;
    overflow: hidden;
    min-height: 72px;
  }
  .flash-header-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .flash-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-primary);
    color: #000;
    font-size: 0.625rem;
    font-weight: 900;
    letter-spacing: 0.15em;
    padding: 0.3rem 0.75rem;
    border-radius: 0.5rem;
    width: fit-content;
  }
  .flash-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #000;
    animation: fpulse 1.4s ease-in-out infinite;
  }
  @keyframes fpulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  .flash-divider {
    width: 1px;
    height: 10px;
    background: rgba(0, 0, 0, 0.3);
  }
  .flash-sub {
    font-size: 0.6875rem;
    color: rgba(245, 197, 24, 0.6);
    font-weight: 600;
  }

  .flash-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.625rem;
  }
  @media (min-width: 480px) {
    .flash-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .flash-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.03);
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .flash-card:hover:not(.flash-selected) {
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.055);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
  .flash-selected {
    background: rgba(245, 197, 24, 0.07) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .flash-ribbon {
    position: absolute;
    top: 0;
    left: 0;
    background: var(--color-primary);
    color: #000;
    font-size: 0.5625rem;
    font-weight: 900;
    padding: 0.2rem 0.5rem;
    border-bottom-right-radius: 0.5rem;
    letter-spacing: 0.04em;
    z-index: 4;
  }

  .flash-card-body {
    padding: 0.875rem 0.75rem 0.625rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    flex: 1;
  }
  .flash-img-wrap {
    position: relative;
    width: fit-content;
    margin-bottom: 0.125rem;
  }
  .instant-dot {
    position: absolute;
    bottom: -2px;
    right: -4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #34d399;
    border: 1.5px solid #0f0f0f;
    box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
  }
  .flash-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.3;
  }
  .flash-prices {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .flash-price {
    font-size: 0.875rem;
    font-weight: 900;
    color: var(--color-primary);
    letter-spacing: -0.01em;
  }
  .flash-orig {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.25);
    text-decoration: line-through;
  }

  .flash-stock {
    padding: 0.5rem 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .stock-bar-wrap {
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.07);
    border-radius: 9999px;
    overflow: hidden;
  }
  .stock-bar-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .stock-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .stock-label {
    font-size: 0.5625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .stock-nums {
    font-size: 0.5625rem;
    color: rgba(255, 255, 255, 0.25);
    font-variant-numeric: tabular-nums;
  }

  .flash-footer {
    padding: 0.4rem 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    background: rgba(255, 255, 255, 0.015);
  }
  .instant-badge {
    font-size: 0.5625rem;
    font-weight: 800;
    color: #34d399;
    letter-spacing: 0.04em;
  }

  /* ─────────────────────────────────────
     SPECIAL ITEMS panel
  ───────────────────────────────────── */
  .special-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  @media (min-width: 480px) {
    .special-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .special-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0.875rem;
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }
  .special-card:hover:not(.special-selected) {
    border-color: rgba(255, 255, 255, 0.13);
    background: rgba(255, 255, 255, 0.055);
    transform: translateX(2px);
  }
  .special-selected {
    background: rgba(245, 197, 24, 0.07) !important;
  }

  .special-icon-wrap {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .special-icon-active {
    background: rgba(245, 197, 24, 0.12);
    border-color: rgba(245, 197, 24, 0.25);
    box-shadow: 0 0 12px rgba(245, 197, 24, 0.15);
  }
  .special-info {
    flex: 1;
    min-width: 0;
  }
  .special-label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .special-price {
    font-size: 0.875rem;
    font-weight: 900;
    color: var(--color-primary);
    margin-top: 0.2rem;
  }
  .special-instant {
    font-size: 0.5625rem;
    font-weight: 700;
    color: #34d399;
    margin-top: 0.2rem;
    display: block;
  }

  .special-check {
    width: 1.375rem;
    height: 1.375rem;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .special-check-active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #000;
    box-shadow: 0 2px 8px rgba(245, 197, 24, 0.4);
  }

  /* ─────────────────────────────────────
     DIAMONDS panel
  ───────────────────────────────────── */
  .diamond-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  @media (min-width: 420px) {
    .diamond-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (min-width: 640px) {
    .diamond-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .diamond-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 0.875rem 0.5rem 0.75rem;
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    text-align: center;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }
  .diamond-card:hover:not(.diamond-selected) {
    border-color: rgba(255, 255, 255, 0.13);
    background: rgba(255, 255, 255, 0.055);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
  .diamond-selected {
    background: rgba(245, 197, 24, 0.07) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  .diamond-img-wrap {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    background: rgba(255, 255, 255, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-bottom: 0.125rem;
  }
  .diamond-img-active {
    background: rgba(245, 197, 24, 0.1);
    box-shadow: 0 0 16px rgba(245, 197, 24, 0.2);
  }
  .diamond-label {
    font-size: 0.6875rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.3;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 0.25rem;
  }
  .diamond-sub {
    font-size: 0.5625rem;
    color: #34d399;
    font-weight: 600;
  }
  .diamond-price {
    font-size: 0.75rem;
    font-weight: 900;
    color: var(--color-primary);
    letter-spacing: -0.01em;
  }
</style>
