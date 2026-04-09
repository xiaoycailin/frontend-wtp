<script lang="ts">
  import { onMount } from "svelte";
  import TiltCard from "$lib/components/TiltCard.svelte";

  let { data } = $props();
  const categories = data?.categories ?? [];

  // Filter state
  let search = $state("");
  let selectedCategory = $state("all");
  let selectedSubCategory = $state("all");
  let sortBy = $state("latest");
  let page = $state(1);
  let limit = $state(24);

  // Data state
  let products = $state<any[]>([]);
  let total = $state(0);
  let totalPages = $state(1);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Subcategory options derived from selected category
  const subCategories = $derived(() => {
    if (selectedCategory === "all") return [];
    const cat = categories.find((c: any) => c.id === selectedCategory);
    return cat?.subCategories || [];
  });

  // Fetch products
  async function fetchProducts() {
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedSubCategory && selectedSubCategory !== "all") params.set("sub", selectedSubCategory);
      if (sortBy) params.set("sort", sortBy);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/v1/products/list?${params}`);
      if (!res.ok) throw new Error("Gagal memuat produk");
      const json = await res.json();
      products = json.items || [];
      total = json.total || 0;
      totalPages = Math.ceil(total / limit) || 1;
    } catch (e: any) {
      error = e.message || "Terjadi kesalahan";
      products = [];
      total = 0;
      totalPages = 1;
    } finally {
      loading = false;
    }
  }

  // Reset to page 1 when filters change
  function applyFilters() {
    page = 1;
    fetchProducts();
  }

  onMount(() => {
    fetchProducts();
  });

  // Format currency
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Compute available categories for dropdown (including "all")
  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    ...categories.map((c: any) => ({ value: c.id, label: c.title })),
  ];

  const sortOptions = [
    { value: "latest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "low_price", label: "Harga Terendah" },
    { value: "high_price", label: "Harga Tertinggi" },
  ];
</script>

<svelte:head>
  <title>Produk - WTPANJAY</title>
  <meta name="description" content="Jelajahi berbagai produk top-up dan voucher dengan harga terbaik." />
</svelte:head>

<div class="min-h-screen bg-[#050505] text-white py-8 px-4 md:px-6">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <header class="mb-8">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1">
            Katalog Produk
          </p>
          <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
            Top‑Up & Voucher
          </h1>
          <p class="text-xs md:text-sm text-white/50 mt-1">
            Temukan produk terbaik dengan filter dan pencarian.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="text-white/40">
            {total} produk ditemukan
          </span>
        </div>
      </div>
    </header>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Sidebar Filters -->
      <aside class="lg:w-64 flex-shrink-0">
        <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 space-y-5 sticky top-6">
          <h2 class="text-lg font-bold text-white">Filter</h2>

          <!-- Search -->
          <div class="space-y-2">
            <label class="text-sm text-white/70">Cari produk</label>
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={search}
                placeholder="Nama produk..."
                class="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[var(--color-primary)]"
              />
              <button
                on:click={applyFilters}
                class="px-3 py-2 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
              >
                Cari
              </button>
            </div>
          </div>

          <!-- Category -->
          <div class="space-y-2">
            <label class="text-sm text-white/70">Kategori</label>
            <select
              bind:value={selectedCategory}
              class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[var(--color-primary)]"
            >
              {#each categoryOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>

          <!-- Subcategory (if category selected) -->
          {#if subCategories.length > 0}
            <div class="space-y-2">
              <label class="text-sm text-white/70">Sub Kategori</label>
              <select
                bind:value={selectedSubCategory}
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[var(--color-primary)]"
              >
                <option value="all">Semua Sub Kategori</option>
                {#each subCategories as sub}
                  <option value={sub.id}>{sub.title}</option>
                {/each}
              </select>
            </div>
          {/if}

          <!-- Sort -->
          <div class="space-y-2">
            <label class="text-sm text-white/70">Urutkan</label>
            <select
              bind:value={sortBy}
              class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[var(--color-primary)]"
            >
              {#each sortOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>

          <!-- Apply Filters Button -->
          <button
            on:click={applyFilters}
            class="w-full px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-black font-bold hover:bg-[#ffd740] transition-colors"
          >
            Terapkan Filter
          </button>

          <!-- Reset -->
          <button
            on:click={() => {
              search = "";
              selectedCategory = "all";
              selectedSubCategory = "all";
              sortBy = "latest";
              page = 1;
              fetchProducts();
            }}
            class="w-full px-4 py-2 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          >
            Reset Filter
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1">
        {#if error}
          <div class="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        {/if}

        <!-- Loading State -->
        {#if loading && products.length === 0}
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {#each { length: 8 } as _}
              <div class="aspect-square rounded-2xl bg-[#0c0c0c] border border-white/5 animate-pulse"></div>
            {/each}
          </div>
        {:else if products.length === 0}
          <div class="text-center py-20 text-white/40">
            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-lg font-medium">Tidak ada produk ditemukan.</p>
            <p class="text-sm mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        {:else}
          <!-- Product Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {#each products as product}
              <TiltCard maxTilt={25}>
                <a
                  href="/{product.slug}"
                  class="group relative block rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.07] transition-all duration-300 cursor-pointer hover:border-[var(--color-primary)]/30"
                >
                  <!-- Thumbnail -->
                  <div class="relative aspect-square overflow-hidden bg-[#0a0a0a]">
                    {#if product.thumbnails?.[0]}
                      <img
                        src={product.thumbnails[0]}
                        alt={product.title}
                        class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    {:else}
                      <div class="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                        <span class="text-white/30 text-xs">No image</span>
                      </div>
                    {/if}
                    <!-- Badge -->
                    {#if product.status === "SOLD"}
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black leading-none tracking-wide shadow-lg bg-red-500 text-white">
                        HABIS
                      </div>
                    {:else if product.status === "AVAILABLE"}
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black leading-none tracking-wide shadow-lg bg-green-500 text-white">
                        READY
                      </div>
                    {/if}
                  </div>

                  <!-- Info -->
                  <div class="p-3">
                    <h3 class="text-sm font-bold text-white leading-tight line-clamp-1 mb-1 group-hover:text-[var(--color-primary)]">
                      {product.title}
                    </h3>
                    <p class="text-xs text-white/50 line-clamp-2 mb-2 min-h-[2rem]">
                      {product.description || "Tidak ada deskripsi"}
                    </p>
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-[10px] text-white/30">Harga</p>
                        <p class="text-[14px] font-black text-[var(--color-primary)]">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div class="text-[10px] text-white/40">
                        Stok: {product.stock}
                      </div>
                    </div>
                  </div>

                  <!-- Bottom glow on hover -->
                  <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </TiltCard>
            {/each}
          </div>

          <!-- Pagination -->
          {#if totalPages > 1}
            <div class="mt-10 flex items-center justify-between border-t border-white/5 pt-6 text-sm">
              <div class="text-white/50">
                Halaman {page} dari {totalPages} • {total} produk
              </div>
              <div class="flex items-center gap-1">
                <button
                  on:click={() => { page -= 1; fetchProducts(); }}
                  disabled={page <= 1}
                  class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 disabled:opacity-30"
                >
                  ← Sebelumnya
                </button>
                {#each { length: totalPages } as _, i}
                  {@const p = i + 1}
                  {#if p === page || p === page - 1 || p === page + 1 || p === 1 || p === totalPages}
                    <button
                      on:click={() => { page = p; fetchProducts(); }}
                      class={`px-3 py-1.5 rounded-lg border ${p === page ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)]' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}
                    >
                      {p}
                    </button>
                  {:else if (p === page - 2 && p > 2) || (p === page + 2 && p < totalPages - 1)}
                    <span class="px-2 text-white/30">...</span>
                  {/if}
                {/each}
                <button
                  on:click={() => { page += 1; fetchProducts(); }}
                  disabled={page >= totalPages}
                  class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 disabled:opacity-30"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          {/if}
        {/if}
      </main>
    </div>
  </div>
</div>

<style>
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>