<script lang="ts">
  type ProductItem = {
    id: string;
    title: string;
    price: number | string;
    status?: string;
  };

  type FlashSaleItem = {
    id: number;
    productId?: string;
    discount: number | string;
    discType: "flat" | "percent";
    stock: number;
    sellCount?: number;
    createdAt?: string;
    products?: {
      id: string;
      title: string;
      price: number | string;
      status?: string;
      subCategory?: {
        title?: string;
      };
    };
  };

  let flashSales = $state<FlashSaleItem[]>([]);
  let products = $state<ProductItem[]>([]);
  let loading = $state(false);
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);

  let form = $state({
    productId: "",
    discType: "flat",
    discount: "",
    stock: "10",
  });

  function formatCurrency(value: string | number) {
    const n = Number(value ?? 0);
    return n.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  }

  function formatDate(value?: string) {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function unwrapData(payload: any) {
    if (!payload || typeof payload !== "object") return payload;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    return payload?.data ?? payload;
  }

  async function loadProducts() {
    const res = await fetch("/api/v1/products/list?page=1&limit=100");
    const json = await res.json();
    const data = unwrapData(json) ?? {};
    products = data.items ?? data.products ?? [];
  }

  async function loadFlashSales() {
    const res = await fetch("/api/v1/products/flashsale");
    const json = await res.json();
    const data = unwrapData(json);
    flashSales = Array.isArray(data) ? data : [];
  }

  async function bootstrap() {
    loading = true;
    error = null;
    try {
      await Promise.all([loadProducts(), loadFlashSales()]);
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat data flash sale";
    } finally {
      loading = false;
    }
  }

  async function createFlashSale() {
    submitting = true;
    error = null;
    success = null;

    try {
      const res = await fetch("/api/v1/products/flashsale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: form.productId,
          discType: form.discType,
          discount: Number(form.discount),
          stock: Number(form.stock),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message ?? json?.data?.message ?? "Gagal membuat flash sale");
      }

      form = {
        productId: "",
        discType: "flat",
        discount: "",
        stock: "10",
      };
      success = "Flash sale berhasil dibuat";
      await loadFlashSales();
    } catch (e: any) {
      error = e?.message ?? "Gagal membuat flash sale";
    } finally {
      submitting = false;
    }
  }

  async function deleteFlashSale(id: number) {
    const ok = window.confirm("Yakin mau hapus flash sale ini?");
    if (!ok) return;

    error = null;
    success = null;
    try {
      const res = await fetch(`/api/v1/products/flashsale/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message ?? "Gagal hapus flash sale");
      }
      success = "Flash sale berhasil dihapus";
      await loadFlashSales();
    } catch (e: any) {
      error = e?.message ?? "Gagal hapus flash sale";
    }
  }

  $effect(() => {
    bootstrap();
  });
</script>

<section class="space-y-5">
  <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div>
      <p class="text-xs font-semibold text-[#f5c518] uppercase tracking-[0.18em] mb-1">Promo & Flash Sale</p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">Flash Sale Management</h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">Kelola promo diskon produk yang tampil sebagai flash sale di halaman topup.</p>
    </div>
  </header>

  <div class="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
    <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-4">
      <div>
        <h2 class="text-sm font-bold text-white">Buat Flash Sale</h2>
        <p class="text-[11px] text-white/50 mt-1">Pilih produk lalu tentukan tipe diskon dan stok promo.</p>
      </div>

      <div class="space-y-3 text-xs">
        <label class="flex flex-col gap-1">
          <span class="text-white/60">Produk</span>
          <select bind:value={form.productId} class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[#f5c518]">
            <option value="">Pilih produk</option>
            {#each products as product}
              <option value={product.id}>{product.title}</option>
            {/each}
          </select>
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col gap-1">
            <span class="text-white/60">Tipe Diskon</span>
            <select bind:value={form.discType} class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[#f5c518]">
              <option value="flat">Flat</option>
              <option value="percent">Percent</option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-white/60">Stok</span>
            <input bind:value={form.stock} type="number" min="0" class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[#f5c518]" />
          </label>
        </div>

        <label class="flex flex-col gap-1">
          <span class="text-white/60">Nilai Diskon</span>
          <input bind:value={form.discount} type="number" min="1" class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[#f5c518]" placeholder={form.discType === "percent" ? "contoh 10" : "contoh 5000"} />
        </label>
      </div>

      <button type="button" onclick={createFlashSale} disabled={submitting || !form.productId || !form.discount} class="w-full px-3 py-2 rounded-lg font-semibold bg-[#f5c518] text-black hover:bg-[#ffd740] disabled:opacity-50">
        {submitting ? "Menyimpan..." : "Buat Flash Sale"}
      </button>

      {#if success}
        <p class="text-[11px] text-emerald-300">{success}</p>
      {/if}
      {#if error}
        <p class="text-[11px] text-red-300">{error}</p>
      {/if}
    </div>

    <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden">
      <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-white">Daftar Flash Sale</h2>
          <p class="text-[11px] text-white/50 mt-1">Total {flashSales.length} flash sale aktif/tersimpan.</p>
        </div>
      </div>

      {#if loading}
        <div class="p-4 text-sm text-white/50">Memuat data...</div>
      {:else if flashSales.length === 0}
        <div class="p-4 text-sm text-white/50">Belum ada flash sale.</div>
      {:else}
        <div class="divide-y divide-white/5">
          {#each flashSales as item}
            <div class="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div class="space-y-1 min-w-0">
                <p class="text-sm font-semibold text-white truncate">{item.products?.title ?? "Produk tidak ditemukan"}</p>
                <p class="text-[11px] text-white/45">{item.products?.subCategory?.title ?? "-"} · {item.products?.status ?? "-"}</p>
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/65">
                  <span>Harga asli: {formatCurrency(item.products?.price ?? 0)}</span>
                  <span>Diskon: {item.discType === "percent" ? `${item.discount}%` : formatCurrency(item.discount)}</span>
                  <span>Stok: {item.stock}</span>
                  <span>Terjual: {item.sellCount ?? 0}</span>
                  <span>Dibuat: {formatDate(item.createdAt)}</span>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button type="button" onclick={() => deleteFlashSale(item.id)} class="px-3 py-2 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20">
                  Hapus
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>
