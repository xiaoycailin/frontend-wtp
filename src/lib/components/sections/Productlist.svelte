<script lang="ts">
  import TiltCard from "../TiltCard.svelte";
  import { fmt } from "./topup-components/utils";

  interface Game {
    slug: string; name: string; category: string;
    provider: string; img: string;
    badge?: { label: string; color: string };
    popular?: boolean; priceFrom: string;
  }

  let activeCategory = $state("all");
  let { searchQuery, data } = $props();

  const categories = [{ title: "Semua", id: "all" }, ...data.category];

  const sc: any[] = [];
  categories.forEach((g) => {
    g.subCategories?.forEach((sbc: any) => sc.push(sbc));
  });

  const games: Game[] = sc.map((g) => ({
    category: g.categoryId, img: g.thumbnail,
    name: g.title, provider: g.brand, slug: g.slug,
    priceFrom: fmt(Number(g.priceFrom)) ?? "Rp 0",
    badge: g.badge, popular: true,
  }));

  let hoveredId = $state<string | null>(null);

  const filtered = $derived(
    games.filter((g) => {
      const matchCat   = activeCategory === "all" || g.category === activeCategory;
      const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
  );
</script>

<section class="w-full mt-8">

  <!-- ──────────────────────────────────────
       SECTION HEADER
  ────────────────────────────────────── -->
  <div class="section-header">
    <div class="section-header-left">
      <div class="accent-bar" aria-hidden="true"></div>
      <div>
        <p class="eyebrow">Top Up Sekarang</p>
        <h2 class="section-title">Populer Sekarang</h2>
      </div>
    </div>
    <div class="game-count-pill" aria-live="polite">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
      </svg>
      {filtered.length} game
    </div>
  </div>

  <!-- ──────────────────────────────────────
       CATEGORY TABS
  ────────────────────────────────────── -->
  <div
    class="cat-bar"
    style="position: sticky; top: 55px;"
    role="tablist"
    aria-label="Filter kategori game"
  >
    <div class="cat-scroll">
      {#each categories as cat}
        {@const isActive = activeCategory === cat.id}
        <button
          role="tab"
          aria-selected={isActive}
          class="cat-tab"
          class:cat-tab-active={isActive}
          onclick={() => (activeCategory = cat.id)}
        >
          {cat.title}
          {#if isActive}
            <span class="cat-tab-dot" aria-hidden="true"></span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- ──────────────────────────────────────
       GAME GRID
  ────────────────────────────────────── -->
  {#if filtered.length === 0}
    <!-- Empty state -->
    <div class="empty-state" role="status">
      <div class="empty-icon" aria-hidden="true">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="empty-title">Game tidak ditemukan</p>
      <p class="empty-sub">Coba kata kunci lain atau pilih kategori berbeda</p>
    </div>

  {:else}
    <div class="game-grid">
      {#each filtered as game (game.slug)}
        <TiltCard maxTilt={20}>
          <a
            href="/{game.slug}"
            class="game-card"
            class:game-card-hovered={hoveredId === game.slug}
            onmouseenter={() => (hoveredId = game.slug)}
            onmouseleave={() => (hoveredId = null)}
            aria-label="Top up {game.name}, mulai dari {game.priceFrom}"
          >
            <!-- ── Thumbnail ── -->
            <div class="card-thumb">
              <img
                src={game.img} alt={game.name}
                class="card-img" loading="lazy"
                width="300" height="300"
              />

              <!-- Hover gradient overlay -->
              <div class="card-overlay" aria-hidden="true"></div>

              <!-- Shine sweep -->
              <div class="card-shine" aria-hidden="true"></div>

              <!-- Badge -->
              {#if game.badge}
                <div
                  class="card-badge"
                  style="background:{game.badge.color};"
                  aria-label="Badge: {game.badge.label}"
                >
                  {game.badge.label}
                </div>
              {/if}

              <!-- Hover CTA -->
              <div class="card-cta" aria-hidden="true">
                <span class="card-cta-btn">
                  Top Up
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="10" height="10">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </span>
              </div>
            </div>

            <!-- ── Info ── -->
            <div class="card-info">
              <div class="card-info-top">
                <h3 class="card-name">{game.name}</h3>
                <p class="card-provider">{game.provider}</p>
              </div>

              <div class="card-price-row">
                <div>
                  <p class="card-price-label">Mulai dari</p>
                  <p class="card-price">{game.priceFrom}</p>
                </div>
                <div class="card-arrow" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="12" height="12">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Bottom glow line -->
            <div class="card-glow-line" aria-hidden="true"></div>
          </a>
        </TiltCard>
      {/each}
    </div>
  {/if}

</section>

<style>
  /* ── Section Header ── */
  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; margin-bottom: 1rem; padding: 0 0.125rem;
  }
  .section-header-left {
    display: flex; align-items: center; gap: 0.75rem;
  }
  .accent-bar {
    width: 3px; height: 2rem; border-radius: 9999px;
    background: linear-gradient(to bottom,
      var(--color-primary), rgba(245,197,24,0.3));
    box-shadow: 0 0 10px rgba(245,197,24,0.45);
    flex-shrink: 0;
  }
  .eyebrow {
    font-size: 0.5625rem; font-weight: 800;
    color: rgba(245,197,24,0.6);
    text-transform: uppercase; letter-spacing: 0.16em;
    line-height: 1; margin-bottom: 0.2rem;
  }
  .section-title {
    font-size: 1.25rem; font-weight: 900; color: #fff;
    line-height: 1; letter-spacing: -0.02em;
  }
  .game-count-pill {
    display: flex; align-items: center; gap: 0.3rem;
    padding: 0.3rem 0.75rem; border-radius: 9999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 0.625rem; color: rgba(255,255,255,0.35); font-weight: 700;
    flex-shrink: 0; white-space: nowrap;
  }

  /* ── Category bar ── */
  .cat-bar {
    z-index: 40;
    background: rgba(14,14,14,0.85);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    margin: 0 -1px; padding: 0.625rem 0 0.625rem;
    margin-bottom: 1rem;
  }
  .cat-scroll {
    display: flex; align-items: center; gap: 0.375rem;
    overflow-x: auto; padding: 0.25rem 0.25rem 0.125rem;
    -ms-overflow-style: none; scrollbar-width: none;
  }
  .cat-scroll::-webkit-scrollbar { display: none; }

  .cat-tab {
    position: relative;
    display: flex; align-items: center; gap: 0.375rem;
    flex-shrink: 0;
    padding: 0.4rem 0.875rem; border-radius: 9999px;
    font-size: 0.75rem; font-weight: 700;
    border: 1px solid transparent;
    cursor: pointer; white-space: nowrap;
    transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.45);
    border-color: rgba(255,255,255,0.07);
  }
  .cat-tab:hover:not(.cat-tab-active) {
    background: rgba(255,255,255,0.09);
    color: rgba(255,255,255,0.7);
    border-color: rgba(255,255,255,0.12);
  }
  .cat-tab-active {
    background: var(--color-primary);
    color: #000; border-color: transparent;
    box-shadow: 0 0 14px rgba(245,197,24,0.3);
  }
  .cat-tab-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: rgba(0,0,0,0.4); flex-shrink: 0;
  }

  /* ── Empty state ── */
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center;
    padding: 5rem 1rem; gap: 0.5rem;
  }
  .empty-icon {
    width: 4rem; height: 4rem; border-radius: 1.25rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.15); margin-bottom: 0.5rem;
  }
  .empty-title {
    font-size: 0.9375rem; font-weight: 800; color: rgba(255,255,255,0.3);
  }
  .empty-sub {
    font-size: 0.6875rem; color: rgba(255,255,255,0.2); max-width: 24ch;
  }

  /* ── Game grid ── */
  .game-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  @media (min-width: 480px)  { .game-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 768px)  { .game-grid { grid-template-columns: repeat(4, 1fr); gap: 1rem; } }
  @media (min-width: 1024px) { .game-grid { grid-template-columns: repeat(5, 1fr); } }
  @media (min-width: 1280px) { .game-grid { grid-template-columns: repeat(6, 1fr); } }

  /* ── Game card ── */
  .game-card {
    display: block; position: relative;
    border-radius: 1rem; overflow: hidden;
    background: #111;
    border: 1px solid rgba(255,255,255,0.07);
    text-decoration: none;
    transition:
      border-color  0.25s ease,
      box-shadow    0.3s ease,
      transform     0.15s ease;
    will-change: transform;
  }
  .game-card:hover,
  .game-card-hovered {
    border-color: rgba(245,197,24,0.25);
    box-shadow:
      0 0 0 1px rgba(245,197,24,0.12),
      0 16px 40px rgba(0,0,0,0.5),
      0 0 30px rgba(245,197,24,0.08);
  }
  .game-card:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* ── Thumbnail ── */
  .card-thumb {
    position: relative; aspect-ratio: 1 / 1; overflow: hidden;
    background: #0a0a0a;
  }
  .card-img {
    width: 100%; height: 100%; object-fit: cover; object-position: center;
    display: block;
    transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .game-card:hover .card-img,
  .game-card-hovered .card-img {
    transform: scale(1.08);
  }

  /* Overlay gradient (always present, more visible on hover) */
  .card-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.7) 0%,
      rgba(0,0,0,0.2) 40%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .game-card:hover .card-overlay,
  .game-card-hovered .card-overlay { opacity: 1; }

  /* Shine sweep */
  .card-shine {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(
      115deg, transparent 30%,
      rgba(255,255,255,0.07) 50%, transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .game-card:hover .card-shine,
  .game-card-hovered .card-shine { opacity: 1; }

  /* Badge */
  .card-badge {
    position: absolute; top: 0.5rem; left: 0.5rem;
    padding: 0.2rem 0.5rem; border-radius: 0.4rem;
    font-size: 0.5rem; font-weight: 900;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  /* CTA on hover */
  .card-cta {
    position: absolute; inset: 0;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 0.625rem;
    opacity: 0; pointer-events: none;
    transition: opacity 0.25s ease;
  }
  .game-card:hover .card-cta,
  .game-card-hovered .card-cta { opacity: 1; }
  .card-cta-btn {
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.4rem 0.875rem; border-radius: 9999px;
    background: var(--color-primary); color: #000;
    font-size: 0.625rem; font-weight: 900;
    letter-spacing: 0.04em; white-space: nowrap;
    box-shadow: 0 0 16px rgba(245,197,24,0.5), 0 4px 12px rgba(0,0,0,0.4);
  }

  /* ── Card info ── */
  .card-info {
    padding: 0.625rem 0.75rem 0.75rem;
    display: flex; flex-direction: column; gap: 0.5rem;
    background: linear-gradient(to bottom,
      rgba(14,14,14,0.5), #111 60%);
  }
  .card-info-top { display: flex; flex-direction: column; gap: 0.1rem; }
  .card-name {
    font-size: 0.75rem; font-weight: 800; color: #fff; line-height: 1.25;
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 1; -webkit-box-orient: vertical;
    transition: color 0.2s ease;
  }
  .game-card:hover .card-name,
  .game-card-hovered .card-name { color: var(--color-primary); }
  .card-provider {
    font-size: 0.5625rem; color: rgba(255,255,255,0.3);
    font-weight: 600; line-height: 1;
  }

  .card-price-row {
    display: flex; align-items: center; justify-content: space-between; gap: 0.25rem;
  }
  .card-price-label {
    font-size: 0.5rem; color: rgba(255,255,255,0.25);
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
    line-height: 1; margin-bottom: 0.15rem;
  }
  .card-price {
    font-size: 0.75rem; font-weight: 900; color: var(--color-primary);
    line-height: 1; font-variant-numeric: tabular-nums;
  }
  .card-arrow {
    width: 1.625rem; height: 1.625rem; border-radius: 0.5rem; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.25);
    transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
  }
  .game-card:hover .card-arrow,
  .game-card-hovered .card-arrow {
    background: var(--color-primary);
    border-color: transparent;
    color: #000;
    box-shadow: 0 0 10px rgba(245,197,24,0.35);
  }

  /* Bottom glow line */
  .card-glow-line {
    position: absolute; bottom: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg,
      transparent, var(--color-primary), transparent);
    box-shadow: 0 0 8px var(--color-primary);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 9999px;
  }
  .game-card:hover .card-glow-line,
  .game-card-hovered .card-glow-line { opacity: 1; }
</style>