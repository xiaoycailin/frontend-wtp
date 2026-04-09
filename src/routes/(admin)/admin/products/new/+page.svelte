<script lang="ts">
  import { goto } from "$app/navigation";

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
  const categories: Category[] = data?.categories ?? [];

  let title = $state("");
  let description = $state("");
  let subCategoryId = $state("");
  let price = $state<string | number>("");
  let currency = $state("IDR");
  let stock = $state<string | number>(100);
  let thumbnails = $state("");
  let conditionNotes = $state("Brand new. Warranty 1 year.");
  let special = $state(false);

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

  const canSubmit = $derived(
    !!title && !!subCategoryId && !!price && !!currency && !loading,
  );

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!canSubmit) return;

    loading = true;
    error = null;

    try {
      const body = {
        title,
        description: description || undefined,
        subCategoryId,
        price: Number(price),
        currency,
        stock: Number(stock || 0),
        thumbnails: thumbnails || undefined,
        conditionNotes: conditionNotes || undefined,
        special,
      };

      const res = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal menambah produk");
      }

      await goto("/admin/products");
    } catch (e: any) {
      console.error(e);
      error = e?.message ?? "Gagal menambah produk";
    } finally {
      loading = false;
    }
  }
</script>

<section class="space-y-6 max-w-2xl">
  <header class="space-y-1">
    <p class="text-xs font-semibold text-[#f5c518] uppercase tracking-[0.18em]">
      Produk Baru
    </p>
    <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
      Tambah Produk
    </h1>
    <p class="text-xs md:text-sm text-white/50 mt-1">
      Lengkapi detail produk top-up yang akan tampil di halaman utama.
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
          placeholder="Weekly Diamond Pass"
          bind:value={title}
          required
        />
      </div>
      <div class="space-y-1.5">
        <label class="text-xs text-white/70">Sub Kategori</label>
        <select
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[#f5c518]/70"
          bind:value={subCategoryId}
          required
        >
          <option value="">Pilih sub kategori</option>
          {#each availableSubCategories as sub}
            <option value={sub.id}>{sub.categoryTitle} - {sub.title}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="text-xs text-white/70">Deskripsi</label>
      <textarea
        rows="3"
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[#f5c518]/70 resize-y"
        placeholder="877 dm ml cepat fast"
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
          placeholder="45000"
          bind:value={price}
          required
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
          placeholder="999"
          bind:value={stock}
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="text-xs text-white/70">URL Thumbnail</label>
      <input
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[#f5c518]/70"
        placeholder="https://asset.weebin.site/uploads/...jpg"
        bind:value={thumbnails}
      />
    </div>

    <div class="space-y-1.5">
      <label class="text-xs text-white/70">Catatan Kondisi</label>
      <textarea
        rows="2"
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[#f5c518]/70 resize-y"
        bind:value={conditionNotes}
      />
    </div>

    <div class="flex items-center gap-2">
      <label class="inline-flex items-center gap-2 text-xs text-white/80">
        <input
          type="checkbox"
          class="rounded border-white/20 bg-black/60"
          bind:checked={special}
        />
        Tandai sebagai produk spesial
      </label>
    </div>

    <div class="flex items-center gap-2 pt-2">
      <button
        type="submit"
        class="px-4 py-2 rounded-lg text-xs font-semibold bg-[#f5c518] text-black
               hover:bg-[#ffd740] disabled:opacity-50"
        disabled={!canSubmit}
      >
        {loading ? "Menyimpan..." : "Simpan Produk"}
      </button>
      <button
        type="button"
        class="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white/70 border border-white/10
               hover:bg-white/10"
        onclick={() => goto("/admin/products")}
      >
        Batal
      </button>
    </div>
  </form>
</section>
