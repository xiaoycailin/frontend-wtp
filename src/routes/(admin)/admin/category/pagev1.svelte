<script lang="ts">
  import ImageUrlField from "$lib/components/admin/ImageUrlField.svelte";
  import MultiImageUrlField from "$lib/components/admin/MultiImageUrlField.svelte";

  type Badge = {
    id: number;
    label: string;
    color: string;
  };

  type SubCategory = {
    id: string;
    title: string;
    slug: string;
    categoryId: string;
    thumbnail?: string | null;
    description?: string | null;
    banners?: string[] | null;
    brand?: string | null;
    instant?: boolean;
    popular?: boolean;
    badgeId?: number | null;
    badge?: Badge | null;
    createdAt: string;
    updatedAt: string;
  };

  type Category = {
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    subCategories?: SubCategory[];
  };

  let categories = $state<Category[]>([]);
  let badges = $state<Badge[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let deletingCategoryId = $state<string | null>(null);
  let deletingSubId = $state<string | null>(null);

  // token bisa kamu ganti ambil dari cookies/localStorage
  const token = $state<string | null>(null);

  // modal state
  let showCategoryModal = $state(false);
  let showSubModal = $state(false);

  let editingCategory = $state<Category | null>(null);
  let editingSub = $state<SubCategory | null>(null);
  let parentCategoryForSub = $state<Category | null>(null);

  // form state kategori
  const catForm = $state({
    title: "",
  });

  // form state sub kategori
  const subForm = $state({
    title: "",
    thumbnail: "",
    description: "",
    banners: "", // textarea, 1 url per baris
    brand: "",
    badgeId: "",
  });

  function normalizeConfig(obj: Record<string, unknown>) {
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined || v === "") continue;
      copy[k] = v;
    }
    return copy;
  }

  async function fetchBadges() {
    try {
      const res = await fetch("/api/v1/badges");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal memuat badge");
      }
      badges = json.data ?? [];
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchCategories() {
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/category");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal memuat kategori");
      }
      categories.splice(0, categories.length, ...(json.data ?? []));
    } catch (e: any) {
      error = e?.message ?? "Terjadi kesalahan saat memuat kategori";
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchCategories();
    fetchBadges();
  });

  function openCreateCategory() {
    editingCategory = null;
    catForm.title = "";
    showCategoryModal = true;
  }

  function openEditCategory(cat: Category) {
    editingCategory = cat;
    catForm.title = cat.title;
    showCategoryModal = true;
  }

  function openCreateSub(cat: Category) {
    editingSub = null;
    parentCategoryForSub = cat;
    subForm.title = "";
    subForm.thumbnail = "";
    subForm.description = "";
    subForm.banners = "";
    subForm.brand = "";
    subForm.badgeId = "";
    showSubModal = true;
  }

  function openEditSub(cat: Category, sub: SubCategory) {
    editingSub = sub;
    parentCategoryForSub = cat;
    subForm.title = sub.title ?? "";
    subForm.thumbnail = sub.thumbnail ?? "";
    subForm.description = sub.description ?? "";
    subForm.banners = (sub.banners ?? []).join("\n");
    subForm.brand = sub.brand ?? "";
    subForm.badgeId = sub.badgeId ? String(sub.badgeId) : "";
    showSubModal = true;
  }

  async function submitCategory() {
    if (!catForm.title.trim()) {
      alert("Title wajib diisi");
      return;
    }

    const isEdit = !!editingCategory;
    const url = isEdit
      ? `/api/v1/category/${editingCategory!.id}`
      : "/api/v1/category";
    const method = isEdit ? "PUT" : "POST";

    try {
      loading = true;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(normalizeConfig({ title: catForm.title.trim() })),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal menyimpan kategori");
      }

      showCategoryModal = false;
      await fetchCategories();
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan kategori");
    } finally {
      loading = false;
    }
  }

  async function submitSub() {
    if (!parentCategoryForSub && !editingSub) {
      alert("CategoryId tidak ditemukan");
      return;
    }

    if (!subForm.title.trim()) {
      alert("Title wajib diisi");
      return;
    }

    const isEdit = !!editingSub;
    const url = isEdit
      ? `/api/v1/category/sub/${editingSub!.id}`
      : `/api/v1/category/sub/${parentCategoryForSub!.id}`;
    const method = isEdit ? "PUT" : "POST";

    const banners =
      subForm.banners.trim() === ""
        ? undefined
        : subForm.banners
            .split("\n")
            .map((b) => b.trim())
            .filter(Boolean);

    const payload = normalizeConfig({
      title: subForm.title.trim(),
      thumbnail: subForm.thumbnail.trim(),
      description: subForm.description.trim(),
      banners,
      brand: subForm.brand.trim(),
      badgeId: subForm.badgeId,
    });

    try {
      loading = true;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal menyimpan sub kategori");
      }

      showSubModal = false;
      await fetchCategories();
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan sub kategori");
    } finally {
      loading = false;
    }
  }

  async function handleDeleteCategory(cat: Category) {
    const confirmed = window.confirm(
      `Yakin mau hapus kategori \"${cat.title}\" beserta semua sub kategorinya?`,
    );
    if (!confirmed) return;

    deletingCategoryId = cat.id;
    error = null;

    try {
      const res = await fetch(`/api/v1/category/${cat.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal menghapus kategori",
        );
      }

      categories = categories.filter((item) => item.id !== cat.id);
    } catch (e: any) {
      error = e?.message ?? "Gagal menghapus kategori";
    } finally {
      deletingCategoryId = null;
    }
  }

  async function handleDeleteSub(sub: SubCategory) {
    const confirmed = window.confirm(
      `Yakin mau hapus sub kategori \"${sub.title}\"?`,
    );
    if (!confirmed) return;

    deletingSubId = sub.id;
    error = null;

    try {
      const res = await fetch(`/api/v1/category/sub/${sub.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          json?.data?.message ??
            json?.message ??
            "Gagal menghapus sub kategori",
        );
      }

      categories = categories.map((cat) => ({
        ...cat,
        subCategories: (cat.subCategories ?? []).filter(
          (item) => item.id !== sub.id,
        ),
      }));
    } catch (e: any) {
      error = e?.message ?? "Gagal menghapus sub kategori";
    } finally {
      deletingSubId = null;
    }
  }
</script>

<section class="space-y-6">
  <header
    class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
  >
    <div>
      <p
        class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1"
      >
        Kategori & Sub Kategori
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Manajemen Kategori
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Atur kategori utama dan sub kategori produk top-up & voucher.
      </p>
    </div>
    <div class="flex items-center gap-2 text-xs">
      <button
        type="button"
        class="px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
        on:click={openCreateCategory}
      >
        + Tambah Kategori
      </button>
    </div>
  </header>

  {#if error}
    <p class="text-xs text-red-400">{error}</p>
  {/if}

  {#if loading && !categories.length}
    <p class="text-xs text-white/50">Memuat data...</p>
  {/if}

  <div class="space-y-4">
    {#if !categories.length && !loading}
      <p class="text-xs text-white/50">Belum ada kategori.</p>
    {:else}
      {#each categories as cat}
        <article
          class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden"
        >
          <header
            class="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/5"
          >
            <div class="space-y-0.5 text-xs">
              <p class="text-[11px] text-white/40 uppercase tracking-[0.16em]">
                Kategori
              </p>
              <h2 class="text-sm font-semibold text-white">{cat.title}</h2>
              <p class="text-[11px] text-white/40">Slug: {cat.slug}</p>
            </div>
            <div class="inline-flex items-center gap-1.5">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                on:click={() => openEditCategory(cat)}
              >
                Edit Kategori
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 disabled:opacity-50"
                disabled={deletingCategoryId === cat.id}
                on:click={() => handleDeleteCategory(cat)}
              >
                {deletingCategoryId === cat.id ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </header>

          <div class="px-4 py-3">
            <div class="flex items-center justify-between mb-2 text-xs">
              <p class="text-white/60">
                Sub Kategori
                <span class="text-white/40">
                  ({cat.subCategories?.length ?? 0})
                </span>
              </p>
              <button
                type="button"
                class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                on:click={() => openCreateSub(cat)}
              >
                + Tambah Sub Kategori
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-[11px]">
                <thead class="bg-white/5">
                  <tr>
                    <th class="px-3 py-2 font-semibold text-white/60">
                      Sub Kategori
                    </th>
                    <th class="px-3 py-2 font-semibold text-white/60">Brand</th>
                    <th class="px-3 py-2 font-semibold text-white/60">
                      Instant
                    </th>
                    <th class="px-3 py-2 font-semibold text-white/60">
                      Popular
                    </th>
                    <th class="px-3 py-2 font-semibold text-white/60">Slug</th>
                    <th
                      class="px-3 py-2 font-semibold text-white/60 text-right"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#if !cat.subCategories?.length}
                    <tr>
                      <td
                        colspan="6"
                        class="px-3 py-4 text-center text-white/40"
                      >
                        Belum ada sub kategori.
                      </td>
                    </tr>
                  {:else}
                    {#each cat.subCategories as sub}
                      <tr class="border-t border-white/5 hover:bg-white/[0.03]">
                        <td class="px-3 py-2 align-top">
                          <div class="flex items-center gap-2">
                            {#if sub.thumbnail}
                              <img
                                src={sub.thumbnail}
                                alt={sub.title}
                                class="w-8 h-8 rounded-md object-cover"
                                loading="lazy"
                              />
                            {/if}
                            <div class="min-w-0">
                              <p
                                class="text-xs font-semibold text-white truncate"
                              >
                                {sub.title}
                              </p>
                              <p class="text-[10px] text-white/40 line-clamp-2">
                                {sub.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td class="px-3 py-2 align-top text-white/80">
                          <div class="space-y-1">
                            <div>{sub.brand ?? "-"}</div>
                            {#if sub.badge}
                              <span
                                class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={`background:${sub.badge.color}22; color:${sub.badge.color}; border:1px solid ${sub.badge.color}55`}
                              >
                                {sub.badge.label}
                              </span>
                            {/if}
                          </div>
                        </td>
                        <td class="px-3 py-2 align-top">
                          <span
                            class="text-[10px] rounded-full px-2 py-0.5 border border-white/15 text-white/70 bg-black/40"
                          >
                            {sub.instant ? "Ya" : "Tidak"}
                          </span>
                        </td>
                        <td class="px-3 py-2 align-top">
                          <span
                            class="text-[10px] rounded-full px-2 py-0.5 border border-white/15 text-white/70 bg-black/40"
                          >
                            {sub.popular ? "Ya" : "Tidak"}
                          </span>
                        </td>
                        <td class="px-3 py-2 align-top text-white/60">
                          {sub.slug}
                        </td>
                        <td class="px-3 py-2 align-top text-right">
                          <div class="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                              on:click={() => openEditSub(cat, sub)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 disabled:opacity-50"
                              disabled={deletingSubId === sub.id}
                              on:click={() => handleDeleteSub(sub)}
                            >
                              {deletingSubId === sub.id
                                ? "Menghapus..."
                                : "Hapus"}
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
        </article>
      {/each}
    {/if}
  </div>
</section>

{#if showCategoryModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-3"
      style="width: 100%; max-width: 480px; margin: 0 auto;"
    >
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-semibold text-white">
          {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
        </h2>
        <button
          class="text-xs text-white/50 hover:text-white"
          on:click={() => (showCategoryModal = false)}
        >
          Tutup
        </button>
      </div>

      <div class="space-y-2 text-xs">
        <label class="flex flex-col gap-1">
          <span class="text-white/70">Nama kategori</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={catForm.title}
            placeholder="Contoh: Topup Games"
          />
        </label>
      </div>

      <div class="flex justify-end gap-2 pt-2 text-xs">
        <button
          class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          type="button"
          on:click={() => (showCategoryModal = false)}
        >
          Batal
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
          type="button"
          on:click={submitCategory}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showSubModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-3"
      style="width: 100%; max-width: 480px; margin: 0 auto;"
    >
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="text-sm font-semibold text-white">
            {editingSub ? "Edit Sub Kategori" : "Tambah Sub Kategori"}
          </h2>
          {#if parentCategoryForSub}
            <p class="text-[11px] text-white/40">
              Kategori: {parentCategoryForSub.title}
            </p>
          {/if}
        </div>
        <button
          class="text-xs text-white/50 hover:text-white"
          on:click={() => (showSubModal = false)}
        >
          Tutup
        </button>
      </div>

      <div class="space-y-2 text-xs max-h-[70vh] overflow-y-auto pr-1">
        <label class="flex flex-col gap-1">
          <span class="text-white/70">Nama sub kategori</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={subForm.title}
            placeholder="Contoh: Voucher Google Play"
          />
        </label>

        <ImageUrlField
          label="Thumbnail URL"
          bind:value={subForm.thumbnail}
          placeholder="https://..."
          help="Bisa paste manual atau pilih dari image manager."
        />

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Brand</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={subForm.brand}
            placeholder="Contoh: Google, Moonton"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Badge</span>
          <select
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={subForm.badgeId}
          >
            <option value="">Tanpa badge</option>
            {#each badges as badge}
              <option value={String(badge.id)}>{badge.label}</option>
            {/each}
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Deskripsi</span>
          <textarea
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)] min-h-[80px] resize-y"
            bind:value={subForm.description}
            placeholder="Deskripsi singkat sub kategori"
          />
        </label>

        <MultiImageUrlField
          label="Banner URLs (satu URL per baris)"
          bind:value={subForm.banners}
          placeholder="https://...\nhttps://..."
          help="Pilih beberapa gambar sekaligus, atau paste manual."
        />
      </div>

      <div class="flex justify-end gap-2 pt-2 text-xs">
        <button
          class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          type="button"
          on:click={() => (showSubModal = false)}
        >
          Batal
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
          type="button"
          on:click={submitSub}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  </div>
{/if}
