<script lang="ts">
  type LeaderboardItem = {
    key: string;
    buyerName: string;
    productTitle: string;
    totalAmount: number;
    totalOrders: number;
    totalQuantity: number;
    lastCreatedAt: string;
  };

  let loading = $state(true);
  let error = $state<string | null>(null);
  let updatedAt = $state<string | null>(null);
  let boards = $state<{
    today: LeaderboardItem[];
    week: LeaderboardItem[];
    month: LeaderboardItem[];
  }>({ today: [], week: [], month: [] });

  let activeTab = $state<"today" | "week" | "month">("today");

  function maskCurrency(amount: number) {
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length <= 2) return formatted;
    const visible = digits.slice(0, Math.min(2, digits.length));
    const masked = "x".repeat(Math.max(3, digits.length - visible.length));
    return `Rp${visible}.${masked}`;
  }

  function maskName(name: string) {
    if (!name) return "Pelanggan";
    if (name.length <= 2) return `${name[0]}*`;
    return `${name.slice(0, 2)}${"*".repeat(Math.max(3, name.length - 2))}`;
  }

  function formatUpdatedAt(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadLeaderboard() {
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/leaderboard");
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.data?.message ?? "Gagal memuat leaderboard");
      boards = {
        today: json.data?.today ?? [],
        week: json.data?.week ?? [],
        month: json.data?.month ?? [],
      };
      updatedAt = json.data?.updatedAt ?? null;
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat leaderboard";
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadLeaderboard();
  });

  const tabs = [
    { key: "today" as const, label: "Hari Ini", icon: "today" },
    { key: "week" as const, label: "Minggu Ini", icon: "week" },
    { key: "month" as const, label: "Bulan Ini", icon: "month" },
  ];

  const activeItems = $derived(
    activeTab === "today"
      ? boards.today
      : activeTab === "week"
        ? boards.week
        : boards.month,
  );

  const rankMeta: Record<
    number,
    { bg: string; border: string; color: string; glow: string }
  > = {
    0: {
      bg: "rgba(255,215,0,0.12)",
      border: "rgba(255,215,0,0.35)",
      color: "#ffd700",
      glow: "rgba(255,215,0,0.25)",
    },
    1: {
      bg: "rgba(192,192,192,0.1)",
      border: "rgba(192,192,192,0.3)",
      color: "#c0c0c0",
      glow: "rgba(192,192,192,0.2)",
    },
    2: {
      bg: "rgba(205,127,50,0.1)",
      border: "rgba(205,127,50,0.28)",
      color: "#cd7f32",
      glow: "rgba(205,127,50,0.2)",
    },
  };
</script>

<svelte:head>
  <title>Leaderboard — Topupin</title>
</svelte:head>

<section class="lb-root">
  <!-- ─────────────────────────────────────────
       HERO HEADER
  ───────────────────────────────────────── -->
  <div class="lb-hero">
    <!-- ambient glow -->
    <div class="lb-hero-glow" aria-hidden="true"></div>

    <div class="lb-hero-inner">
      <div class="lb-hero-left">
        <div class="lb-trophy" aria-hidden="true">
          <svg fill="currentColor" viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
            />
            <path
              d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V18H9v2h6v-2h-2v-2.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zm-14 3V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"
            />
          </svg>
        </div>
        <div>
          <p class="lb-eyebrow">Hall of Fame</p>
          <h1 class="lb-heading">Leaderboard Pelanggan</h1>
          <p class="lb-desc">
            Top 10 pelanggan dengan pembelian terbanyak. Data diperbarui secara
            berkala dari sistem kami.
          </p>
        </div>
      </div>

      <div class="lb-hero-meta">
        <div class="lb-meta-item">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="11"
            height="11"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Update: {formatUpdatedAt(updatedAt)}</span>
        </div>
        <button
          class="lb-refresh-btn"
          onclick={loadLeaderboard}
          disabled={loading}
          aria-label="Refresh leaderboard"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="12"
            height="12"
            class:lb-spin={loading}
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? "Memuat..." : "Refresh"}
        </button>
      </div>
    </div>
  </div>

  <!-- ─────────────────────────────────────────
       ERROR
  ───────────────────────────────────────── -->
  {#if error}
    <div class="lb-error" role="alert">
      <svg
        fill="currentColor"
        viewBox="0 0 20 20"
        width="14"
        height="14"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      {error}
    </div>
  {/if}

  <!-- ─────────────────────────────────────────
       TAB SWITCHER
  ───────────────────────────────────────── -->
  <div class="lb-tabs" role="tablist" aria-label="Pilih periode leaderboard">
    {#each tabs as tab}
      {@const isActive = activeTab === tab.key}
      <button
        role="tab"
        aria-selected={isActive}
        class="lb-tab"
        class:lb-tab-active={isActive}
        onclick={() => (activeTab = tab.key)}
      >
        {#if tab.key === "today"}
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07l-.71.71M6.34 17.66l-.71.71M17.66 17.66l-.71-.71M6.34 6.34l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z"
            />
          </svg>
        {:else if tab.key === "week"}
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        {:else}
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        {/if}
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- ─────────────────────────────────────────
       LEADERBOARD TABLE
  ───────────────────────────────────────── -->
  <div class="lb-board" role="tabpanel">
    <!-- Loading skeleton -->
    {#if loading}
      <div class="lb-skeleton-list" aria-label="Memuat leaderboard...">
        {#each Array(5) as _, i}
          <div class="lb-skeleton-row">
            <div class="lb-skel lb-skel-rank"></div>
            <div class="lb-skel-info">
              <div class="lb-skel lb-skel-name"></div>
              <div class="lb-skel lb-skel-sub"></div>
            </div>
            <div class="lb-skel lb-skel-amount"></div>
          </div>
        {/each}
      </div>

      <!-- Empty state -->
    {:else if activeItems.length === 0}
      <div class="lb-empty" role="status">
        <div class="lb-empty-icon" aria-hidden="true">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p class="lb-empty-title">Belum ada data</p>
        <p class="lb-empty-sub">
          Periode ini belum memiliki transaksi yang tercatat.
        </p>
      </div>

      <!-- List -->
    {:else}
      <ol class="lb-list" aria-label="Daftar leaderboard">
        {#each activeItems as item, index}
          {@const rank = rankMeta[index]}
          {@const isTop3 = index < 3}
          <li class="lb-row" class:lb-row-top3={isTop3}>
            <!-- Rank badge -->
            <div
              class="lb-rank"
              class:lb-rank-top3={isTop3}
              style={isTop3
                ? `background:${rank.bg}; border-color:${rank.border}; color:${rank.color}; box-shadow: 0 0 12px ${rank.glow};`
                : ""}
              aria-label="Peringkat {index + 1}"
            >
              {#if index === 0}
                <!-- Gold crown -->
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path
                    d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3a1 1 0 01-1 1H6a1 1 0 010-2h12a1 1 0 011 1z"
                  />
                </svg>
              {:else}
                <span>{index + 1}</span>
              {/if}
            </div>

            <!-- Name + product -->
            <div class="lb-row-info">
              <p class="lb-buyer" class:lb-buyer-top3={isTop3}>
                {maskName(item.buyerName)}
              </p>
              <p class="lb-product">{item.productTitle}</p>
              <div class="lb-tags">
                <span class="lb-tag">
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
                      stroke-width="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {item.totalOrders} transaksi
                </span>
                <span class="lb-tag">
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
                      stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Qty {item.totalQuantity}
                </span>
                <span class="lb-tag lb-tag-date">
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
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {new Date(item.lastCreatedAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </div>

            <!-- Amount -->
            <div class="lb-amount-col">
              <p
                class="lb-amount"
                style={isTop3
                  ? `color:${rank.color}; text-shadow: 0 0 14px ${rank.glow};`
                  : ""}
              >
                {maskCurrency(item.totalAmount)}
              </p>
            </div>

            <!-- Top3 accent line -->
            {#if isTop3}
              <div
                class="lb-row-line"
                style="background: linear-gradient(to right, {rank.color}, transparent); box-shadow: 0 0 6px {rank.glow};"
                aria-hidden="true"
              ></div>
            {/if}
          </li>
        {/each}
      </ol>
    {/if}
  </div>

  <!-- ─────────────────────────────────────────
       FOOTER NOTE
  ───────────────────────────────────────── -->
  <p class="lb-footer-note" aria-label="Catatan privasi">
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
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
    Nama dan nominal pembelian disamarkan untuk menjaga privasi pelanggan.
  </p>
</section>

<style>
  /* ══════════════════════════
     ROOT
  ══════════════════════════ */
  .lb-root {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 52rem;
    margin: 0 auto;
  }

  /* ══════════════════════════
     HERO
  ══════════════════════════ */
  .lb-hero {
    position: relative;
    overflow: hidden;
    border-radius: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #0d0d0d;
    padding: 1.75rem;
  }
  .lb-hero-glow {
    position: absolute;
    top: -3rem;
    left: 50%;
    transform: translateX(-50%);
    width: 20rem;
    height: 8rem;
    border-radius: 50%;
    background: radial-gradient(
      ellipse at center,
      rgba(245, 197, 24, 0.08) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
  .lb-hero-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  @media (min-width: 640px) {
    .lb-hero-inner {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }
  }
  .lb-hero-left {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  .lb-trophy {
    width: 3rem;
    height: 3rem;
    border-radius: 0.875rem;
    flex-shrink: 0;
    background: rgba(245, 197, 24, 0.12);
    border: 1px solid rgba(245, 197, 24, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    box-shadow: 0 0 20px rgba(245, 197, 24, 0.2);
  }
  .lb-eyebrow {
    font-size: 0.5625rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(245, 197, 24, 0.6);
    line-height: 1;
    margin-bottom: 0.35rem;
  }
  .lb-heading {
    font-size: 1.625rem;
    font-weight: 900;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.025em;
  }
  @media (min-width: 640px) {
    .lb-heading {
      font-size: 2rem;
    }
  }
  .lb-desc {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.6;
    max-width: 42ch;
  }

  .lb-hero-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .lb-hero-meta {
      align-items: flex-end;
    }
  }
  .lb-meta-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 600;
  }
  .lb-refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.875rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.6875rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .lb-refresh-btn:hover:not(:disabled) {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.2);
    color: var(--color-primary);
  }
  .lb-refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .lb-spin {
    animation: lb-spin 0.7s linear infinite;
  }

  /* ══════════════════════════
     ERROR
  ══════════════════════════ */
  .lb-error {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    font-size: 0.8125rem;
    color: #fca5a5;
    font-weight: 600;
  }

  /* ══════════════════════════
     TABS
  ══════════════════════════ */
  .lb-tabs {
    display: flex;
    gap: 0.375rem;
    padding: 0.3rem;
    border-radius: 0.875rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
  }
  .lb-tab {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
    justify-content: center;
    padding: 0.55rem 0.75rem;
    border-radius: 0.625rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    border: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
  }
  .lb-tab:hover:not(.lb-tab-active) {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.65);
  }
  .lb-tab-active {
    background: var(--color-primary);
    color: #000;
    box-shadow:
      0 0 16px rgba(245, 197, 24, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }

  /* ══════════════════════════
     BOARD CONTAINER
  ══════════════════════════ */
  .lb-board {
    border-radius: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #0d0d0d;
    overflow: hidden;
    min-height: 20rem;
  }

  /* ── Skeleton ── */
  .lb-skeleton-list {
    display: flex;
    flex-direction: column;
  }
  .lb-skeleton-row {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .lb-skel-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .lb-skel {
    border-radius: 0.375rem;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.06) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
  }
  .lb-skel-rank {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .lb-skel-name {
    height: 0.875rem;
    width: 45%;
  }
  .lb-skel-sub {
    height: 0.6875rem;
    width: 70%;
  }
  .lb-skel-amount {
    height: 1rem;
    width: 4.5rem;
    flex-shrink: 0;
  }

  /* ── Empty ── */
  .lb-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 1rem;
    gap: 0.5rem;
  }
  .lb-empty-icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.15);
    margin-bottom: 0.5rem;
  }
  .lb-empty-title {
    font-size: 0.9375rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.3);
  }
  .lb-empty-sub {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.2);
    max-width: 28ch;
  }

  /* ── List ── */
  .lb-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .lb-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.18s ease;
  }
  .lb-row:last-child {
    border-bottom: none;
  }
  .lb-row:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  .lb-row-top3 {
    background: rgba(255, 255, 255, 0.015);
  }
  .lb-row-top3:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  /* Rank badge */
  .lb-rank {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6875rem;
    font-weight: 900;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.35);
  }
  .lb-rank-top3 {
    border-width: 1.5px;
  }

  /* Info */
  .lb-row-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .lb-buyer {
    font-size: 0.875rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .lb-buyer-top3 {
    color: #fff;
  }
  .lb-product {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.35);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    line-height: 1.4;
  }
  .lb-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.35rem;
  }
  .lb-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.07);
    font-size: 0.5625rem;
    color: rgba(255, 255, 255, 0.35);
    font-weight: 700;
  }
  .lb-tag-date {
    display: none;
  }
  @media (min-width: 480px) {
    .lb-tag-date {
      display: inline-flex;
    }
  }

  /* Amount */
  .lb-amount-col {
    flex-shrink: 0;
    text-align: right;
  }
  .lb-amount {
    font-size: 0.9375rem;
    font-weight: 900;
    color: var(--color-primary);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  /* Left accent line for top3 */
  .lb-row-line {
    position: absolute;
    left: 0;
    top: 15%;
    bottom: 15%;
    width: 2.5px;
    border-radius: 9999px;
  }

  /* ══════════════════════════
     FOOTER NOTE
  ══════════════════════════ */
  .lb-footer-note {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    justify-content: center;
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.2);
    font-weight: 600;
    padding-bottom: 0.5rem;
    text-align: center;
  }

  /* ══════════════════════════
     KEYFRAMES
  ══════════════════════════ */
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  @keyframes lb-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
