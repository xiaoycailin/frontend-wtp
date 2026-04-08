<script lang="ts">
  import TiltCard from "../TiltCard.svelte";

  // ── Types ──────────────────────────────────────────────────────
  interface Game {
    slug: string;
    name: string;
    category: string;
    provider: string;
    img: string;
    badge?: { label: string; color: string };
    popular?: boolean;
    priceFrom: string;
  }

  // ── State ──────────────────────────────────────────────────────
  let activeCategory = $state("all");
  let { searchQuery, data } = $props();
  // console.log(data.category);

  // ── Data ───────────────────────────────────────────────────────
  const categories = [{ title: "Semua", id: "all" }, ...data.category];

  const sc: any[] = [];
  categories.forEach((g) => {
    g.subCategories?.forEach((sbc: any) => {
      sc.push(sbc);
    });
  });

  // console.log(sc);
  const games: Game[] = sc.map((g) => {
    return {
      category: g.categoryId,
      img: g.thumbnail,
      name: g.title,
      provider: g.brand,
      slug: g.slug,
      // TODO: jangan di harcode
      priceFrom: "Rp 10.000",
      badge: { label: "🔥 POPULER", color: "#f5c518" },
      popular: true,
    };
  });

  let hoveredId = $state<string | null>(null);

  // ── Derived filtered list ──────────────────────────────────────
  let filtered = $derived(
    games.filter((g) => {
      const matchCat =
        activeCategory === "all" || g.category === activeCategory;
      const matchSearch = g.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    }),
  );

  // }
</script>

<!-- ═══════════════════════════════════════════
     GAME PRODUCT LIST SECTION
═══════════════════════════════════════════ -->
<section class="w-full mt-6">
  <!-- ── Section Header ── -->
  <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
    <div class="flex items-center gap-3 flex-1">
      <!-- Accent bar -->
      <div
        class="w-1 h-7 rounded-full bg-[#f5c518] shadow-sm shadow-yellow-400/50"
      ></div>
      <div>
        <p
          class="text-[10px] font-bold uppercase tracking-widest text-[#f5c518]/70 leading-none mb-0.5"
        >
          Top Up Sekarang
        </p>
        <h2 class="text-lg font-black text-white leading-none tracking-tight">
          Populer Sekarang
        </h2>
      </div>
    </div>
  </div>

  <!-- ── Category Tabs ── -->
  <div
    class="sticky top-[55px] md:top-[114px] z-40 backdrop-blur-xl p-2 pb-3 bg-[#1a1a1a]/60"
  >
    <div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
      {#each categories as cat}
        <button
          onclick={() => (activeCategory = cat.id)}
          class="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold
               transition-all duration-200 whitespace-nowrap border"
          style="
          background: {activeCategory === cat.id
            ? '#f5c518'
            : 'rgba(255,255,255,0.05)'};
          color: {activeCategory === cat.id ? '#000' : 'rgba(255,255,255,0.5)'};
          border-color: {activeCategory === cat.id
            ? '#f5c518'
            : 'rgba(255,255,255,0.08)'};
        "
        >
          {cat.title}
        </button>
      {/each}

      <span
        class="ml-auto flex-shrink-0 text-[10px] text-white/30 font-medium px-2"
      >
        {filtered.length} game
      </span>
    </div>
  </div>

  <!-- ── Game Grid ── -->
  {#if filtered.length === 0}
    <div class="flex flex-col items-center justify-center py-20 text-white/20">
      <svg
        class="w-12 h-12 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-sm font-medium">Game tidak ditemukan</p>
    </div>
  {:else}
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mt-2"
    >
      {#each filtered as game (game.slug)}
        <!-- ── Game Card ── -->
        <TiltCard maxTilt={25}>
          <a
            href="/{game.slug}"
            class="group relative block rounded-2xl overflow-hidden
                   bg-[#141414] border border-white/[0.07]
                   transition-all duration-300 cursor-pointer"
            style="transition: transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                   box-shadow: {hoveredId === game.slug
              ? '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,197,24,0.2), 0 0 30px rgba(245,197,24,0.08)'
              : '0 4px 16px rgba(0,0,0,0.3)'};"
            onmouseenter={() => (hoveredId = game.slug)}
          >
            <!-- Thumbnail -->
            <div class="relative aspect-square overflow-hidden bg-[#0a0a0a]">
              <img
                src={game.img}
                alt={game.name}
                class="w-full h-full object-cover object-center transition-transform duration-500
                       group-hover:scale-110"
                loading="lazy"
              />

              <!-- Shine sweep on hover -->
              <div
                class="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style="
                  opacity: {hoveredId === game.slug ? 1 : 0};
                  background: linear-gradient(
                    115deg,
                    transparent 30%,
                    rgba(255,255,255,0.08) 50%,
                    transparent 70%
                  );
                "
              ></div>

              <!-- Badge -->
              {#if game.badge}
                <div
                  class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black
                         leading-none tracking-wide shadow-lg"
                  style="background: {game.badge.color}; color: #000;"
                >
                  {game.badge.label}
                </div>
              {/if}

              <!-- Hover overlay with CTA -->
              <div
                class="absolute inset-0 flex items-end justify-center pb-3
                       transition-opacity duration-300 pointer-events-none"
                style="
                  opacity: {hoveredId === game.slug ? 1 : 0};
                  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%);
                "
              >
                <span
                  class="text-[10px] font-bold px-3 py-1.5 rounded-lg text-black"
                  style="background: #f5c518; box-shadow: 0 0 12px rgba(245,197,24,0.5);"
                >
                  Top Up →
                </span>
              </div>
            </div>

            <!-- Info -->
            <div class="p-2.5">
              <h3
                class="text-xs font-bold text-white leading-tight line-clamp-1 mb-0.5 group-hover:text-[#f5c518] transition-colors duration-200"
              >
                {game.name}
              </h3>
              <p class="text-[10px] text-white/35 leading-none mb-2">
                {game.provider}
              </p>

              <!-- Price row -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-[9px] text-white/30 leading-none">
                    Mulai dari
                  </p>
                  <p
                    class="text-[12px] font-black text-[#f5c518] leading-tight"
                  >
                    {game.priceFrom}
                  </p>
                </div>
                <!-- Mini arrow -->
                <div
                  class="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200"
                  style="
                    background: {hoveredId === game.slug
                    ? '#f5c518'
                    : 'rgba(255,255,255,0.05)'};
                    color: {hoveredId === game.slug
                    ? '#000'
                    : 'rgba(255,255,255,0.3)'};
                  "
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Bottom glow line on hover -->
            <div
              class="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300"
              style="
                opacity: {hoveredId === game.slug ? 1 : 0};
                background: linear-gradient(to right, transparent, #f5c518, transparent);
                box-shadow: 0 0 8px #f5c518;
              "
            ></div>
          </a>
        </TiltCard>
      {/each}
    </div>
  {/if}

  <!-- ── Load More ── -->
  {#if filtered.length >= 6}
    <div class="flex justify-center mt-8">
      <button
        class="group flex items-center gap-2 px-6 py-2.5 rounded-xl
               bg-white/5 border border-white/10 text-sm font-semibold text-white/50
               hover:bg-[#f5c518]/10 hover:border-[#f5c518]/30 hover:text-[#f5c518]
               transition-all duration-200"
      >
        <span>Lihat Semua Game</span>
        <svg
          class="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  {/if}
</section>

<style>
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
</style>
