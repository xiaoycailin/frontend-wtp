<script lang="ts">
  import BottomNavigation from "$lib/components/BottomNavigation.svelte";
  import { onMount } from "svelte";

  let { data } = $props();
  const categories = data?.categories ?? [];

  let search = $state("");
  let selectedCategory = $state("all");
  let selectedSubCat = $state("all");
  let sortBy = $state("latest");
  let page = $state(1);
  const limit = 24;

  let products = $state<any[]>([]);
  let total = $state(0);
  let totalPages = $state(1);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // sidebar open on mobile
  let sidebarOpen = $state(false);

  const subCategories = $derived(() => {
    if (selectedCategory === "all") return [];
    return (
      categories.find((c: any) => c.id === selectedCategory)?.subCategories ??
      []
    );
  });

  async function fetchProducts() {
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedSubCat !== "all") params.set("sub", selectedSubCat);
      params.set("sort", sortBy);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/v1/products/list?${params}`);
      if (!res.ok) throw new Error("Gagal memuat produk");
      const json = (await res.json()).data;

      products = json.items ?? [];
      total = json.total ?? 0;
      totalPages = Math.max(1, Math.ceil(total / limit));
    } catch (e: any) {
      error = e.message ?? "Terjadi kesalahan";
      products = [];
      total = 0;
      totalPages = 1;
    } finally {
      loading = false;
    }
  }

  function applyFilters() {
    page = 1;
    fetchProducts();
    sidebarOpen = false;
  }

  function resetFilters() {
    search = "";
    selectedCategory = "all";
    selectedSubCat = "all";
    sortBy = "latest";
    page = 1;
    fetchProducts();
  }

  onMount(fetchProducts);

  function fmt(n: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);
  }

  const sortOptions = [
    { value: "latest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "low_price", label: "Harga Terendah" },
    { value: "high_price", label: "Harga Tertinggi" },
  ];

  const sortLabel = $derived(
    sortOptions.find((s) => s.value === sortBy)?.label ?? "Urutkan",
  );

  // Active filter count for badge
  const activeFilters = $derived(
    (selectedCategory !== "all" ? 1 : 0) +
      (selectedSubCat !== "all" ? 1 : 0) +
      (sortBy !== "latest" ? 1 : 0) +
      (search.trim() ? 1 : 0),
  );
</script>

<svelte:head>
  <title>Produk — {data.siteConfig.siteName}</title>
  <meta
    name="description"
    content="Jelajahi berbagai produk top-up dan voucher dengan harga terbaik."
  />
</svelte:head>

<!-- Mobile sidebar backdrop -->
{#if sidebarOpen}
  <div
    class="sb-backdrop"
    role="presentation"
    onclick={() => (sidebarOpen = false)}
  ></div>
{/if}

<div class="pg-root">
  <div class="pg-inner">
    <!-- ═══════════════════════════════════
         PAGE HEADER
    ═══════════════════════════════════ -->
    <header class="pg-header">
      <div class="pg-header-left">
        <p class="pg-eyebrow">Katalog Produk</p>
        <h1 class="pg-title">Top‑Up & Voucher</h1>
      </div>

      <!-- Mobile filter toggle -->
      <button
        class="pg-filter-toggle"
        onclick={() => (sidebarOpen = !sidebarOpen)}
        aria-expanded={sidebarOpen}
        aria-label="Buka filter"
      >
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
          />
        </svg>
        Filter
        {#if activeFilters > 0}
          <span class="pg-filter-badge">{activeFilters}</span>
        {/if}
      </button>
    </header>

    <div class="pg-layout">
      <!-- ═══════════════════════════════════
           SIDEBAR
      ═══════════════════════════════════ -->
      <aside
        class="pg-sidebar"
        class:pg-sidebar-open={sidebarOpen}
        aria-label="Filter produk"
      >
        <div class="sb-panel">
          <div class="sb-header">
            <div class="sb-header-left">
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              <span>Filter</span>
            </div>
            {#if activeFilters > 0}
              <button class="sb-reset-link" onclick={resetFilters}>Reset</button
              >
            {/if}
          </div>

          <!-- Search -->
          <div class="sb-field">
            <label class="sb-label" for="sb-search">Cari Produk</label>
            <div class="sb-search-wrap">
              <span class="sb-search-icon" aria-hidden="true">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                id="sb-search"
                type="text"
                bind:value={search}
                placeholder="Nama produk..."
                class="sb-input sb-input-search"
                onkeydown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
          </div>

          <!-- Category -->
          <div class="sb-field">
            <label class="sb-label" for="sb-cat">Kategori</label>
            <div class="sb-select-wrap">
              <select
                id="sb-cat"
                bind:value={selectedCategory}
                class="sb-select"
                onchange={() => {
                  selectedSubCat = "all";
                }}
              >
                <option value="all">Semua Kategori</option>
                {#each categories as c}
                  <option value={c.id}>{c.title}</option>
                {/each}
              </select>
              <span class="sb-select-arrow" aria-hidden="true">
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>
          </div>

          <!-- Sub Category -->
          {#if subCategories().length > 0}
            <div class="sb-field">
              <label class="sb-label" for="sb-sub">Sub Kategori</label>
              <div class="sb-select-wrap">
                <select
                  id="sb-sub"
                  bind:value={selectedSubCat}
                  class="sb-select"
                >
                  <option value="all">Semua</option>
                  {#each subCategories() as sub}
                    <option value={sub.id}>{sub.title}</option>
                  {/each}
                </select>
                <span class="sb-select-arrow" aria-hidden="true">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>
          {/if}

          <!-- Sort -->
          <div class="sb-field">
            <label class="sb-label">Urutkan</label>
            <div class="sb-sort-grid">
              {#each sortOptions as opt}
                <button
                  class="sb-sort-btn"
                  class:sb-sort-active={sortBy === opt.value}
                  onclick={() => (sortBy = opt.value)}
                >
                  {opt.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Apply -->
          <button class="sb-apply-btn" onclick={applyFilters}>
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
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Terapkan Filter
          </button>
        </div>
      </aside>

      <!-- ═══════════════════════════════════
           MAIN CONTENT
      ═══════════════════════════════════ -->
      <main class="pg-main">
        <!-- Toolbar -->
        <div class="pg-toolbar">
          <p class="pg-result-count" aria-live="polite">
            {#if loading}
              <span class="pg-loading-dot" aria-hidden="true"></span>
              Memuat...
            {:else}
              <strong>{total}</strong> produk ditemukan
            {/if}
          </p>

          <!-- Sort pill (desktop only, sidebar handles mobile) -->
          <div class="pg-sort-pills" role="group" aria-label="Urutkan produk">
            {#each sortOptions as opt}
              <button
                class="pg-sort-pill"
                class:pg-sort-pill-active={sortBy === opt.value}
                onclick={() => {
                  sortBy = opt.value;
                  applyFilters();
                }}>{opt.label}</button
              >
            {/each}
          </div>
        </div>

        <!-- Error -->
        {#if error}
          <div class="pg-error" role="alert">
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

        <!-- ── Loading Skeleton ── -->
        {#if loading && products.length === 0}
          <div class="prod-list" aria-label="Memuat produk...">
            {#each Array(8) as _, i}
              <div class="prod-skel">
                <div class="prod-skel-thumb"></div>
                <div class="prod-skel-body">
                  <div class="prod-skel-line prod-skel-title"></div>
                  <div class="prod-skel-line prod-skel-desc"></div>
                  <div class="prod-skel-line prod-skel-price"></div>
                </div>
              </div>
            {/each}
          </div>

          <!-- ── Empty state ── -->
        {:else if products.length === 0}
          <div class="pg-empty" role="status">
            <div class="pg-empty-icon" aria-hidden="true">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="26"
                height="26"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="pg-empty-title">Produk tidak ditemukan</p>
            <p class="pg-empty-sub">
              Coba ubah filter atau kata kunci pencarian
            </p>
            <button class="pg-empty-reset" onclick={resetFilters}
              >Reset Filter</button
            >
          </div>

          <!-- ── Product list ── -->
        {:else}
          <ol class="prod-list" aria-label="Daftar produk">
            {#each products as product (product.id)}
              <li>
                <a
                  href="/{product.subCategory?.slug}?productId={product.id}"
                  class="prod-card"
                  class:prod-card-sold={product.status === "SOLD"}
                  aria-label="{product.title}, {fmt(product.price)}"
                >
                  <!-- ── Thumbnail ── -->
                  <div class="prod-thumb-wrap">
                    {#if product.thumbnails}
                      <img
                        src={product.thumbnails}
                        alt={product.title}
                        class="prod-thumb"
                        loading="lazy"
                        width="64"
                        height="64"
                      />
                    {:else}
                      <div class="prod-thumb-fallback" aria-hidden="true">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    {/if}

                    <!-- Status badge -->
                    {#if product.status === "SOLD"}
                      <span class="prod-badge prod-badge-sold">Habis</span>
                    {:else if product.status === "AVAILABLE"}
                      <span class="prod-badge prod-badge-ready">Ready</span>
                    {/if}
                  </div>

                  <!-- ── Info ── -->
                  <div class="prod-info">
                    <div class="prod-info-top">
                      <h3 class="prod-title">{product.title}</h3>
                      {#if product.description}
                        <p class="prod-desc">{product.description}</p>
                      {/if}
                    </div>

                    <div class="prod-info-bottom">
                      <div class="prod-price-col">
                        <p class="prod-price-label">Harga</p>
                        <p class="prod-price">{fmt(product.price)}</p>
                      </div>
                      <div class="prod-meta-col">
                        {#if product.stock !== undefined}
                          <span
                            class="prod-stock"
                            class:prod-stock-low={product.stock < 10}
                          >
                            Stok {product.stock}
                          </span>
                        {/if}
                        {#if product.subCategory?.title}
                          <span class="prod-cat-tag"
                            >{product.subCategory.title}</span
                          >
                        {/if}
                      </div>
                    </div>
                  </div>

                  <!-- Arrow -->
                  <div class="prod-arrow" aria-hidden="true">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  <!-- Hover line -->
                  <div class="prod-hover-line" aria-hidden="true"></div>
                </a>
              </li>
            {/each}
          </ol>

          <!-- ── Pagination ── -->
          {#if totalPages > 1}
            <nav class="pg-pagination" aria-label="Navigasi halaman">
              <div class="pg-page-info">
                Halaman <strong>{page}</strong> dari
                <strong>{totalPages}</strong>
                <span class="pg-page-info-sep" aria-hidden="true">·</span>
                {total} produk
              </div>

              <div class="pg-page-btns" role="group">
                <button
                  class="pg-page-btn pg-page-nav"
                  disabled={page <= 1}
                  onclick={() => {
                    page--;
                    fetchProducts();
                  }}
                  aria-label="Halaman sebelumnya"
                >
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
                      stroke-width="2.5"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {#each { length: totalPages } as _, i}
                  {@const p = i + 1}
                  {#if p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)}
                    <button
                      class="pg-page-btn"
                      class:pg-page-btn-active={p === page}
                      onclick={() => {
                        page = p;
                        fetchProducts();
                      }}
                      aria-label="Halaman {p}"
                      aria-current={p === page ? "page" : undefined}>{p}</button
                    >
                  {:else if p === page - 2 || p === page + 2}
                    <span class="pg-page-ellipsis" aria-hidden="true">…</span>
                  {/if}
                {/each}

                <button
                  class="pg-page-btn pg-page-nav"
                  disabled={page >= totalPages}
                  onclick={() => {
                    page++;
                    fetchProducts();
                  }}
                  aria-label="Halaman berikutnya"
                >
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
                      stroke-width="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </nav>
          {/if}
        {/if}
      </main>
    </div>
  </div>
</div>

<BottomNavigation />

<style>
  /* ══════════════════════════
     PAGE SHELL
  ══════════════════════════ */
  .pg-root {
    min-height: 100vh;
    background: #050505;
    color: #fff;
    padding: 2rem 1rem 4rem;
  }
  .pg-inner {
    max-width: 72rem;
    margin: 0 auto;
  }

  /* ── Header ── */
  .pg-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .pg-eyebrow {
    font-size: 0.5625rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(245, 197, 24, 0.65);
    line-height: 1;
    margin-bottom: 0.35rem;
  }
  .pg-title {
    font-size: 1.75rem;
    font-weight: 900;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.025em;
  }

  /* Mobile filter toggle */
  .pg-filter-toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.875rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.18s ease;
    flex-shrink: 0;
  }
  .pg-filter-toggle:hover {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.25);
    color: var(--color-primary);
  }
  @media (min-width: 1024px) {
    .pg-filter-toggle {
      display: none;
    }
  }

  .pg-filter-badge {
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 50%;
    background: var(--color-primary);
    color: #000;
    font-size: 0.5625rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Layout ── */
  .pg-layout {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
  }

  /* ══════════════════════════
     SIDEBAR
  ══════════════════════════ */
  .sb-backdrop {
    position: fixed;
    inset: 0;
    z-index: 49;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
  }

  .pg-sidebar {
    flex-shrink: 0;
    width: 15rem;
    /* mobile: off-canvas */
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    transform: translateX(-110%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    overflow-y: auto;
    padding: 1rem;
  }
  .pg-sidebar-open {
    transform: translateX(0);
  }

  @media (min-width: 1024px) {
    .pg-sidebar {
      position: sticky;
      top: 1.5rem;
      bottom: unset;
      transform: none;
      overflow-y: visible;
      padding: 0;
      height: fit-content;
    }
  }

  .sb-panel {
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.125rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
  }
  .sb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sb-header-left {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    font-weight: 900;
    color: #fff;
  }
  .sb-reset-link {
    font-size: 0.625rem;
    font-weight: 800;
    color: rgba(245, 197, 24, 0.6);
    cursor: pointer;
    border: none;
    background: none;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: color 0.15s;
  }
  .sb-reset-link:hover {
    color: var(--color-primary);
  }

  .sb-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .sb-label {
    font-size: 0.5625rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  /* Search input */
  .sb-search-wrap {
    position: relative;
  }
  .sb-search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.25);
    pointer-events: none;
  }
  .sb-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 0.625rem;
    color: #fff;
    outline: none;
    font-size: 0.8125rem;
    padding: 0.55rem 0.75rem;
    transition:
      border-color 0.18s ease,
      background 0.18s ease;
  }
  .sb-input-search {
    padding-left: 2.125rem;
  }
  .sb-input:focus {
    border-color: rgba(245, 197, 24, 0.5);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.07);
  }
  .sb-input::placeholder {
    color: rgba(255, 255, 255, 0.18);
  }

  /* Select */
  .sb-select-wrap {
    position: relative;
  }
  .sb-select {
    width: 100%;
    appearance: none;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 0.625rem;
    color: #fff;
    outline: none;
    font-size: 0.8125rem;
    padding: 0.55rem 2rem 0.55rem 0.75rem;
    cursor: pointer;
    transition: border-color 0.18s ease;
  }
  .sb-select:focus {
    border-color: rgba(245, 197, 24, 0.5);
  }
  .sb-select option {
    background: #1a1a1a;
    color: #fff;
  }
  .sb-select-arrow {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.3);
    pointer-events: none;
  }

  /* Sort buttons */
  .sb-sort-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem;
  }
  .sb-sort-btn {
    padding: 0.45rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.6875rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    text-align: center;
    transition: all 0.18s ease;
  }
  .sb-sort-btn:hover {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.7);
  }
  .sb-sort-active {
    background: rgba(245, 197, 24, 0.12);
    border-color: rgba(245, 197, 24, 0.3);
    color: var(--color-primary);
  }

  /* Apply button */
  .sb-apply-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.7rem 1rem;
    border-radius: 0.75rem;
    border: none;
    background: var(--color-primary);
    color: #000;
    font-size: 0.875rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 14px rgba(245, 197, 24, 0.3);
  }
  .sb-apply-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(245, 197, 24, 0.4);
  }

  /* ══════════════════════════
     MAIN
  ══════════════════════════ */
  .pg-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ── Toolbar ── */
  .pg-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .pg-result-count {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.35);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .pg-result-count strong {
    color: rgba(255, 255, 255, 0.7);
  }
  .pg-loading-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-primary);
    animation: pg-pulse 0.9s ease-in-out infinite;
  }

  /* Sort pills — desktop only */
  .pg-sort-pills {
    display: none;
    gap: 0.3rem;
  }
  @media (min-width: 1024px) {
    .pg-sort-pills {
      display: flex;
    }
  }
  .pg-sort-pill {
    padding: 0.35rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.35);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .pg-sort-pill:hover {
    color: rgba(255, 255, 255, 0.65);
    background: rgba(255, 255, 255, 0.07);
  }
  .pg-sort-pill-active {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.25);
    color: var(--color-primary);
  }

  /* ── Error ── */
  .pg-error {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    font-size: 0.8125rem;
    color: #fca5a5;
  }

  /* ══════════════════════════
     PRODUCT LIST (horizontal cards)
  ══════════════════════════ */
  .prod-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .prod-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.75rem 0.875rem;
    border-radius: 0.875rem;
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.07);
    text-decoration: none;
    overflow: hidden;
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.25s ease;
  }
  .prod-card:hover {
    border-color: rgba(245, 197, 24, 0.22);
    background: #111;
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.35),
      0 0 0 1px rgba(245, 197, 24, 0.08);
  }
  .prod-card:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  .prod-card-sold {
    opacity: 0.6;
  }
  .prod-card-sold:hover {
    border-color: rgba(239, 68, 68, 0.2);
    box-shadow: none;
  }

  /* ── Thumbnail ── */
  .prod-thumb-wrap {
    position: relative;
    flex-shrink: 0;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.625rem;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
  }
  .prod-thumb {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: auto;
    padding: 0.25rem;
  }
  .prod-thumb-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.15);
  }

  /* Badges */
  .prod-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 0.4375rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.15rem 0;
  }
  .prod-badge-sold {
    background: rgba(239, 68, 68, 0.85);
    color: #fff;
  }
  .prod-badge-ready {
    background: rgba(34, 197, 94, 0.85);
    color: #fff;
  }

  /* ── Info ── */
  .prod-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }
  .prod-info-top {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .prod-title {
    font-size: 0.875rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.25;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    transition: color 0.18s ease;
  }
  .prod-card:hover .prod-title {
    color: var(--color-primary);
  }
  .prod-desc {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.3);
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .prod-info-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .prod-price-col {
  }
  .prod-price-label {
    font-size: 0.4375rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.2);
    line-height: 1;
    margin-bottom: 0.1rem;
  }
  .prod-price {
    font-size: 0.9375rem;
    font-weight: 900;
    color: var(--color-primary);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .prod-meta-col {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .prod-stock {
    font-size: 0.5625rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.3);
  }
  .prod-stock-low {
    background: rgba(245, 197, 24, 0.08);
    border-color: rgba(245, 197, 24, 0.2);
    color: rgba(245, 197, 24, 0.6);
  }
  .prod-cat-tag {
    font-size: 0.5rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.2);
    display: none;
  }
  @media (min-width: 480px) {
    .prod-cat-tag {
      display: inline-flex;
    }
  }

  /* Arrow */
  .prod-arrow {
    flex-shrink: 0;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.2);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .prod-card:hover .prod-arrow {
    background: var(--color-primary);
    border-color: transparent;
    color: #000;
    box-shadow: 0 0 10px rgba(245, 197, 24, 0.35);
  }

  /* Hover line */
  .prod-hover-line {
    position: absolute;
    left: 0;
    top: 10%;
    bottom: 10%;
    width: 2px;
    border-radius: 9999px;
    background: var(--color-primary);
    opacity: 0;
    transition: opacity 0.2s ease;
    box-shadow: 0 0 8px rgba(245, 197, 24, 0.5);
  }
  .prod-card:hover .prod-hover-line {
    opacity: 1;
  }

  /* ══════════════════════════
     SKELETON
  ══════════════════════════ */
  .prod-skel {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.75rem 0.875rem;
    border-radius: 0.875rem;
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .prod-skel-thumb {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.625rem;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.06);
    animation: shimmer 1.6s ease-in-out infinite;
    background-size: 200% 100%;
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.09) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
  }
  .prod-skel-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .prod-skel-line {
    border-radius: 0.375rem;
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.09) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
  }
  .prod-skel-title {
    height: 0.875rem;
    width: 55%;
  }
  .prod-skel-desc {
    height: 0.6875rem;
    width: 80%;
  }
  .prod-skel-price {
    height: 0.9375rem;
    width: 35%;
  }

  /* ══════════════════════════
     EMPTY
  ══════════════════════════ */
  .pg-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 5rem 1rem;
    gap: 0.5rem;
  }
  .pg-empty-icon {
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
  .pg-empty-title {
    font-size: 0.9375rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.3);
  }
  .pg-empty-sub {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.2);
  }
  .pg-empty-reset {
    margin-top: 0.75rem;
    padding: 0.5rem 1.25rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .pg-empty-reset:hover {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.2);
    color: var(--color-primary);
  }

  /* ══════════════════════════
     PAGINATION
  ══════════════════════════ */
  .pg-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  .pg-page-info {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .pg-page-info strong {
    color: rgba(255, 255, 255, 0.6);
  }
  .pg-page-info-sep {
    color: rgba(255, 255, 255, 0.15);
  }
  .pg-page-btns {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .pg-page-btn {
    min-width: 2.125rem;
    height: 2.125rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 0 0.4rem;
    transition: all 0.18s ease;
  }
  .pg-page-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.09);
    color: rgba(255, 255, 255, 0.7);
  }
  .pg-page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .pg-page-btn-active {
    background: var(--color-primary) !important;
    border-color: transparent !important;
    color: #000 !important;
    box-shadow: 0 0 12px rgba(245, 197, 24, 0.3);
  }
  .pg-page-nav {
    padding: 0;
  }
  .pg-page-ellipsis {
    width: 1.5rem;
    text-align: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.2);
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
  @keyframes pg-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
</style>
