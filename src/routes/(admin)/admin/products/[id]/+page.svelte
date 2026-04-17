<script lang="ts">
  import { goto } from "$app/navigation";
  import ImageUrlField from "$lib/components/admin/ImageUrlField.svelte";

  type SubCategory = {
    id: string;
    title: string;
  };

  type Category = {
    id: string;
    title: string;
    subCategories?: SubCategory[];
  };

  const { data } = $props();

  const product = data.product;
  const categories: Category[] = data?.categories ?? [];

  let title = $state(product.title ?? "");
  let description = $state(product.description ?? "");
  let categoryId = $state(product.categoryId ?? "");
  let subCategoryId = $state(product.subCategoryId ?? "");
  let price = $state<string | number>(product.price ?? "");
  let currency = $state(product.currency ?? "IDR");
  let stock = $state<string | number>(product.stock ?? 0);
  let thumbnails = $state(product.thumbnails ?? "");
  let conditionNotes = $state(product.conditionNotes ?? "");
  let provider = $state(product.provider ?? "digiflazz");

  let loading = $state(false);
  let error = $state<string | null>(null);

  const availableSubCategories = $derived(
    categories.flatMap((category) =>
      (category.subCategories ?? []).map((sub) => ({
        ...sub,
        categoryTitle: category.title,
      })),
    ),
  );

  const canSubmit = $derived(!loading);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = null;

    try {
      const body: any = {};

      if (title !== product.title) body.title = title;
      if (description !== product.description) body.description = description;
      if (categoryId !== product.categoryId) body.categoryId = categoryId;
      if (subCategoryId !== product.subCategoryId)
        body.subCategoryId = subCategoryId;
      if (String(price) !== String(product.price)) body.price = Number(price);
      if (currency !== product.currency) body.currency = currency;
      if (String(stock) !== String(product.stock)) body.stock = Number(stock);
      if (thumbnails !== product.thumbnails) body.thumbnails = thumbnails;
      if (conditionNotes !== product.conditionNotes)
        body.conditionNotes = conditionNotes;
      if (provider !== product.provider) body.provider = provider;

      const res = await fetch(`/api/v1/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal mengubah produk");
      }

      await goto("/admin/products");
    } catch (e: any) {
      console.error(e);
      error = e?.message ?? "Gagal mengubah produk";
    } finally {
      loading = false;
    }
  }
</script>

<section class="space-y-6 max-w-2xl">
  <header class="space-y-1">
    <p class="text-xs font-semibold text-[#f5c518] uppercase tracking-[0.18em]">
      Edit Produk
    </p>
    <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
      {product.title}
    </h1>
    <p class="text-xs md:text-sm text-white/50 mt-1">
      Perbarui informasi produk tanpa mengubah riwayat transaksi.
    </p>
  </header>

  <form class="space-y-4" onsubmit={handleSubmit}>
    {#if error}
      <div
        class="text-xs text-red-300 bg-red-500/10 border border-red-500/40 px-3 py-2 rounded-lg"
      >
        {error}
      </div>
    {/if}

    <div class="grid md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Judul Produk</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[#f5c518]/70"
          bind:value={title}
        />
      </div>
      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Sub Kategori</label>
        <select
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[#f5c518]/70"
          bind:value={subCategoryId}
        >
          <option value="">Pilih sub kategori</option>
          {#each availableSubCategories as sub}
            <option value={sub.id}>{sub.categoryTitle} - {sub.title}</option>
          {/each}
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Provider</label>
        <select
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[#f5c518]/70"
          bind:value={provider}
        >
          <option value="digiflazz">Digiflazz</option>
          <option value="manual">Manual</option>
        </select>
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="text-xs text-white/70">Deskripsi</label>
      <textarea
        rows="3"
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text:white
               focus:outline-none focus:border-[#f5c518]/70 resize-y"
        bind:value={description}
      />
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Harga</label>
        <input
          type="number"
          min="0"
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[#f5c518]/70"
          bind:value={price}
        />
      </div>
      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Mata Uang</label>
        <select
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[#f5c518]/70"
          bind:value={currency}
        >
          <option value="IDR">IDR</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Stok</label>
        <input
          type="number"
          min="0"
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[#f5c518]/70"
          bind:value={stock}
        />
      </div>
    </div>

    <ImageUrlField
      label="URL Thumbnail"
      bind:value={thumbnails}
      placeholder="https://asset.weebin.site/uploads/...jpg"
      help="Bisa paste manual atau pilih dari image manager."
    />

    <div class="space-y-1.5">
      <label class="text-xs text-white/70">Catatan Kondisi</label>
      <textarea
        rows="2"
        class="w-full px-3 py-2 rounded-lg bg:black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[#f5c518]/70 resize-y"
        bind:value={conditionNotes}
      />
    </div>

    <div class="flex items-center gap-2 pt-2">
      <button
        type="submit"
        class="px-4 py-2 rounded-lg text-xs font-semibold bg-[#f5c518] text-black
               hover:bg-[#ffd740] disabled:opacity-50"
        disabled={loading || !canSubmit}
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
      <button
        type="button"
        class="px-3 py-2 rounded-lg text-xs font-semibold bg:white/5 text-white/70 border border-white/10
               hover:bg:white/10"
        onclick={() => goto("/admin/products")}
      >
        Batal
      </button>
    </div>
  </form>
</section>
