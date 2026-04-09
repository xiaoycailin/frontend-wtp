<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  // Initial state dari serverload
  let products = $state(data.products ?? []);
  let total = $state(data.total ?? products.length);
  let pageNum = $state(data.page ?? 1);
  let limit = $state(data.limit ?? 20);
  let q = $state<string>(data.q ?? "");
  let sort = $state<string>(data.sort ?? "latest");
  let filterCategory = $state<string>(data.category ?? "");
  let filterStatus = $state<string>(data.status ?? "");
  let categories = $state<{ id: string; title: string }[]>([]);

  const totalPages = $derived(Math.max(1, Math.ceil(total / limit)));

  let loading = $state(false);
  let error = $state<string | null>(null);
  let deletingId = $state<string | null>(null);

  // inline edit state
  type Status =
    | "DRAFT"
    | "PUBLISHED"
    | "AVAILABLE"
    | "RESERVED"
    | "SOLD"
    | "BANNED";

  let editingPriceId = $state<string | null>(null);
  let editingStockId = $state<string | null>(null);
  let updatingStatusId = $state<string | null>(null);

  const statusOptions: Status[] = [
    "DRAFT",
    "PUBLISHED",
    "AVAILABLE",
    "RESERVED",
    "SOLD",
    "BANNED",
  ];

  const fmtRp = (val: string | number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));

  async function fetchProductsClient() {
    loading = true;
    error = null;

    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", String(limit));
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (filterCategory) params.set("category", filterCategory);
    if (filterStatus) params.set("status", filterStatus);

    try {
      const res = await fetch(`/api/v1/products/list?${params.toString()}`);
      const json = await res.json();
      const d = json?.data ?? {};

      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal memuat data produk");
      }

      products = d.items ?? [];
      total = d.total ?? 0;
      pageNum = d.page ?? pageNum;
      limit = d.limit ?? limit;
    } catch (e: any) {
      console.error(e);
      error = e?.message ?? "Gagal memuat data produk";
      products = [];
      total = 0;
    } finally {
      loading = false;
    }
  }

  async function handleSearch(e: Event) {
    e.preventDefault();
    pageNum = 1;
    await fetchProductsClient();
  }

  async function handleFilterChange() {
    pageNum = 1;
    await fetchProductsClient();
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/v1/category");
      const json = await res.json();
      if (res.ok && json?.data) {
        categories = json.data;
      }
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  }

  $effect(() => {
    fetchCategories();
  });

  async function goToPage(target: number) {
    if (target < 1 || target > totalPages) return;
    pageNum = target;
    await fetchProductsClient();
  }

  // Inline update helpers
  async function updateProduct(partial: Record<string, unknown>, id: string) {
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal mengubah produk");
      }
      // update lokal
      products = products.map((p: any) =>
        p.id === id ? { ...p, ...partial } : p,
      );
    } catch (e: any) {
      console.error(e);
      error = e?.message ?? "Gagal mengubah produk";
    }
  }

  async function handleStatusChange(id: string, value: Status) {
    updatingStatusId = id;
    await updateProduct({ status: value }, id);
    updatingStatusId = null;
  }

  async function handlePriceBlur(id: string, value: string) {
    editingPriceId = null;
    const num = Number(value || 0);
    if (Number.isNaN(num)) return;
    await updateProduct({ price: num }, id);
  }

  async function handleStockBlur(id: string, value: string) {
    editingStockId = null;
    const num = Number(value || 0);
    if (Number.isNaN(num)) return;
    await updateProduct({ stock: num }, id);
  }

  async function handleDeleteProduct(id: string, title: string) {
    const confirmed = window.confirm(
      `Yakin mau hapus produk \"${title}\"?`,
    );

    if (!confirmed) return;

    deletingId = id;
    error = null;

    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.data?.message ?? json?.message ?? "Gagal menghapus produk");
      }

      products = products.filter((p: any) => p.id !== id);
      total = Math.max(0, total - 1);
    } catch (e: any) {
      console.error(e);
      error = e?.message ?? "Gagal menghapus produk";
    } finally {
      deletingId = null;
    }
  }
</script>

<section class="space-y-5">
  <header
    class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
  >
    <div>
      <p
        class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1"
      >
        Manajemen Produk
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Daftar Produk
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Kelola produk top-up yang tampil di halaman utama. Kamu bisa melihat
        harga, stok, status, dan informasi kategori secara cepat dari tabel ini.
      </p>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-black
               hover:bg-[#ffd740] transition-colors duration-150"
        onclick={() => goto("/admin/products/new")}
      >
        + Tambah Produk
      </button>
    </div>
  </header>

  <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden">
    <div
      class="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3"
    >
      <p class="text-xs text-white/50">
        Menampilkan
        <span class="text-white font-semibold">{products.length}</span>
        dari
        <span class="text-white font-semibold">{total}</span>
        produk.
      </p>

      <div class="flex flex-wrap items-center gap-2 text-xs">
        <form class="flex items-center gap-2" onsubmit={handleSearch}>
          <input
            type="text"
            name="q"
            bind:value={q}
            placeholder="Cari judul produk..."
            class="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px]
                   placeholder:text-white/30 text-white focus:outline-none focus:border-[var(--color-primary)]/60"
          />
          <button
            type="submit"
            class="px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-[11px] text-white/70 hover:bg-white/15"
            disabled={loading}
          >
            {loading ? "..." : "Cari"}
          </button>
        </form>

        <select
          bind:value={filterCategory}
          onchange={handleFilterChange}
          class="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white focus:outline-none focus:border-[var(--color-primary)]/60"
        >
          <option value="">Semua Kategori</option>
          {#each categories as cat}
            <option value={cat.id}>{cat.title}</option>
          {/each}
        </select>

        <select
          bind:value={filterStatus}
          onchange={handleFilterChange}
          class="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white focus:outline-none focus:border-[var(--color-primary)]/60"
        >
          <option value="">Semua Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
          <option value="SOLD">Sold</option>
          <option value="BANNED">Banned</option>
        </select>

        <select
          bind:value={sort}
          onchange={handleFilterChange}
          class="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white focus:outline-none focus:border-[var(--color-primary)]/60"
        >
          <option value="latest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="low_price">Harga Terendah</option>
          <option value="high_price">Harga Tertinggi</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-xs">
        <thead class="bg-white/5 border-b border-white/5">
          <tr>
            <th class="px-4 py-2.5 font-semibold text-white/60">Produk</th>
            <th class="px-4 py-2.5 font-semibold text-white/60">Kategori</th>
            <th class="px-4 py-2.5 font-semibold text-white/60">Harga</th>
            <th class="px-4 py-2.5 font-semibold text-white/60 text-right"
              >Stok</th
            >
            <th class="px-4 py-2.5 font-semibold text-white/60">Status</th>
            <th class="px-4 py-2.5 font-semibold text:white/60">Penjual</th>
            <th class="px-4 py-2.5 font-semibold text-white/60 text-right"
              >Aksi</th
            >
          </tr>
        </thead>
        <tbody>
          {#if loading && !products.length}
            <tr>
              <td colspan="7" class="px-4 py-6 text-center text-white/40">
                Memuat data...
              </td>
            </tr>
          {:else if error}
            <tr>
              <td colspan="7" class="px-4 py-6 text-center text-red-300">
                {error}
              </td>
            </tr>
          {:else if !products.length}
            <tr>
              <td colspan="7" class="px-4 py-6 text-center text:white/40">
                Belum ada produk.
              </td>
            </tr>
          {:else}
            {#each products as p}
              <tr
                class="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
              >
                <!-- Produk -->
                <td class="px-4 py-3 align-top">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg bg-[#151515] overflow-hidden flex-shrink-0"
                    >
                      {#if p.thumbnails}
                        <img
                          src={p.thumbnails}
                          alt={p.title}
                          class="w-full h-full object-cover"
                          loading="lazy"
                        />
                      {:else}
                        <div
                          class="w-full h-full flex items-center justify-center text-[10px] text-white/30"
                        >
                          No img
                        </div>
                      {/if}
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-semibold text-white truncate">
                        {p.title}
                      </p>
                      <p class="text-[10px] text-white/40 truncate">
                        {p.skuCode ?? "Tanpa SKU"}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Kategori -->
                <td class="px-4 py-3 align-top">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[11px] text-white/80">
                      {p.subCategory?.title ?? "-"}
                    </span>
                    <span class="text-[10px] text-white/35">
                      {p.category?.title ?? "Topup Games"}
                    </span>
                  </div>
                </td>

                <!-- Harga (inline editable) -->
                <td class="px-4 py-3 align-top">
                  {#if editingPriceId === p.id}
                    <input
                      type="number"
                      min="0"
                      value={p.price}
                      class="w-24 px-2 py-1 rounded bg-black/40 border border-white/20 text-[11px] text-white
                             focus:outline-none focus:border-[var(--color-primary)]/70"
                      onblur={(e) =>
                        handlePriceBlur(
                          p.id,
                          (e.currentTarget as HTMLInputElement).value,
                        )}
                      onkeydown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handlePriceBlur(
                            p.id,
                            (e.currentTarget as HTMLInputElement).value,
                          );
                        }
                      }}
                    />
                  {:else}
                    <button
                      type="button"
                      class="flex flex-col text-left"
                      onclick={() => (editingPriceId = p.id)}
                    >
                      <span class="text-xs font-semibold text-[var(--color-primary)]">
                        {fmtRp(p.price)}
                      </span>
                      <span
                        class="text-[10px] text-white/35 uppercase tracking-[0.16em]"
                      >
                        {p.currency}
                      </span>
                    </button>
                  {/if}
                </td>

                <!-- Stok (inline editable) -->
                <td class="px-4 py-3 align-top text-right">
                  {#if editingStockId === p.id}
                    <input
                      type="number"
                      min="0"
                      value={p.stock}
                      class="w-16 px-2 py-1 rounded bg-black/40 border border-white/20 text-[11px] text-white
                             text-right focus:outline-none focus:border-[var(--color-primary)]/70"
                      onblur={(e) =>
                        handleStockBlur(
                          p.id,
                          (e.currentTarget as HTMLInputElement).value,
                        )}
                      onkeydown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleStockBlur(
                            p.id,
                            (e.currentTarget as HTMLInputElement).value,
                          );
                        }
                      }}
                    />
                  {:else}
                    <button
                      type="button"
                      class="text-xs text-white/80"
                      onclick={() => (editingStockId = p.id)}
                    >
                      {p.stock}
                    </button>
                  {/if}
                </td>

                <!-- Status (dropdown) -->
                <td class="px-4 py-3 align-top">
                  <div class="flex flex-col gap-1">
                    <select
                      class="px-2 py-1 rounded bg-black/40 border border-white/20 text-[11px] text-white
                             focus:outline-none focus:border-[var(--color-primary)]/70"
                      bind:value={p.status}
                      disabled={updatingStatusId === p.id}
                      onchange={(e) =>
                        handleStatusChange(
                          p.id,
                          (e.currentTarget as HTMLSelectElement)
                            .value as Status,
                        )}
                    >
                      {#each statusOptions as s}
                        <option value={s}>{s}</option>
                      {/each}
                    </select>
                    <span class="text-[10px] text-white/35">
                      {p.instant ? "Instan" : "Manual"}
                    </span>
                  </div>
                </td>

                <!-- Penjual -->
                <td class="px-4 py-3 align-top">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center
                             text-[10px] font-bold text-[var(--color-primary)]"
                    >
                      {p.sellerUser?.displayName?.charAt(0) ?? "?"}
                    </div>
                    <span class="text-[11px] text-white/80 truncate">
                      {p.sellerUser?.displayName ?? "-"}
                    </span>
                  </div>
                </td>

                <!-- Aksi -->
                <td class="px-4 py-3 align-top text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      class="px-2 py-1 rounded-lg text-[11px] font-semibold
                             bg-white/5 text-white/80 border border-white/10
                             hover:bg-white/10"
                      onclick={() => goto(`/admin/products/${p.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="px-2 py-1 rounded-lg text-[11px] font-semibold
                             bg-red-500/10 text-red-300 border border-red-500/40
                             hover:bg-red-500/20 disabled:opacity-50"
                      disabled={deletingId === p.id}
                      onclick={() => handleDeleteProduct(p.id, p.title)}
                    >
                      {deletingId === p.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <div
    class="flex items-center justify-between gap-3 text-xs text-white/50 mt-3"
  >
    <p>
      Halaman <span class="text-white font-semibold">{pageNum}</span>
      dari <span class="text-white font-semibold">{totalPages}</span>
    </p>

    <div class="inline-flex items-center gap-1">
      <button
        type="button"
        class="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5
               text-white/70 hover:bg-white/10 disabled:opacity-40"
        disabled={pageNum <= 1 || loading}
        onclick={() => goToPage(pageNum - 1)}
      >
        Prev
      </button>
      <button
        type="button"
        class="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5
               text-white/70 hover:bg-white/10 disabled:opacity-40"
        disabled={pageNum >= totalPages || loading}
        onclick={() => goToPage(pageNum + 1)}
      >
        Next
      </button>
    </div>
  </div>
</section>

