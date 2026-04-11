<script lang="ts">
  import ImageUrlField from "$lib/components/admin/ImageUrlField.svelte";

  type BannerType = "banner" | "popup";

  type BannerItem = {
    id: number;
    title: string;
    imageUrl: string;
    type: BannerType;
    clickUrl?: string | null;
  };

  type FormState = {
    title: string;
    imageUrl: string;
    type: BannerType;
    clickUrl: string;
  };

  let banners = $state<BannerItem[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let deletingId = $state<number | null>(null);
  let saving = $state(false);

  let showModal = $state(false);
  let editingBanner = $state<BannerItem | null>(null);
  let form = $state<FormState>({
    title: "",
    imageUrl: "",
    type: "banner",
    clickUrl: "",
  });

  function normalizePayload() {
    return {
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      type: form.type,
      clickUrl: form.clickUrl.trim(),
    };
  }

  function resetForm() {
    form.title = "";
    form.imageUrl = "";
    form.type = "banner";
    form.clickUrl = "";
  }

  function openCreateModal() {
    editingBanner = null;
    resetForm();
    showModal = true;
  }

  function openEditModal(item: BannerItem) {
    editingBanner = item;
    form.title = item.title ?? "";
    form.imageUrl = item.imageUrl ?? "";
    form.type = item.type ?? "banner";
    form.clickUrl = item.clickUrl ?? "";
    showModal = true;
  }

  async function fetchBanners() {
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/banners");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal memuat banners");
      }
      banners = json.data ?? [];
    } catch (e: any) {
      error = e?.message ?? "Terjadi kesalahan saat memuat banners";
    } finally {
      loading = false;
    }
  }

  async function submitBanner() {
    const payload = normalizePayload();

    if (!payload.title) {
      alert("Judul banner wajib diisi");
      return;
    }

    if (!payload.imageUrl) {
      alert("Image URL wajib diisi");
      return;
    }

    saving = true;
    error = null;

    const isEdit = !!editingBanner;
    const url = isEdit ? `/api/v1/banners/${editingBanner!.id}` : "/api/v1/banners";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal menyimpan banner",
        );
      }

      showModal = false;
      resetForm();
      await fetchBanners();
    } catch (e: any) {
      error = e?.message ?? "Gagal menyimpan banner";
      alert(error);
    } finally {
      saving = false;
    }
  }

  async function deleteBanner(item: BannerItem) {
    const confirmed = window.confirm(`Yakin mau hapus banner \"${item.title}\"?`);
    if (!confirmed) return;

    deletingId = item.id;
    error = null;
    try {
      const res = await fetch(`/api/v1/banners/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal menghapus banner",
        );
      }
      banners = banners.filter((banner) => banner.id !== item.id);
    } catch (e: any) {
      error = e?.message ?? "Gagal menghapus banner";
    } finally {
      deletingId = null;
    }
  }

  function typeBadgeClass(type: BannerType) {
    return type === "popup"
      ? "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/40"
      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
  }

  $effect(() => {
    fetchBanners();
  });
</script>

<section class="space-y-6">
  <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div>
      <p class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1">
        Banner Management
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Pengaturan Banners
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Atur banner homepage dan popup promo dari satu halaman admin.
      </p>
    </div>
    <button
      type="button"
      class="px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740] text-xs"
      onclick={openCreateModal}
    >
      + Tambah Banner
    </button>
  </header>

  {#if error}
    <div class="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
      {error}
    </div>
  {/if}

  <section class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold text-white">Daftar Banner</h2>
        <p class="text-[11px] text-white/40">Banner type = slider homepage, popup = buat promo/modal nanti.</p>
      </div>
      <button
        type="button"
        class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
        onclick={fetchBanners}
        disabled={loading}
      >
        {loading ? "Memuat..." : "Refresh"}
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-[11px]">
        <thead class="bg-white/5">
          <tr>
            <th class="px-3 py-2 font-semibold text-white/60">Preview</th>
            <th class="px-3 py-2 font-semibold text-white/60">Judul</th>
            <th class="px-3 py-2 font-semibold text-white/60">Type</th>
            <th class="px-3 py-2 font-semibold text-white/60">Click URL</th>
            <th class="px-3 py-2 font-semibold text-white/60 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if loading && !banners.length}
            <tr>
              <td colspan="5" class="px-3 py-6 text-center text-white/40">Memuat data banners...</td>
            </tr>
          {:else if !banners.length}
            <tr>
              <td colspan="5" class="px-3 py-6 text-center text-white/40">Belum ada banner.</td>
            </tr>
          {:else}
            {#each banners as item}
              <tr class="border-t border-white/5 hover:bg-white/[0.03]">
                <td class="px-3 py-2 align-top">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    class="w-24 h-14 rounded-lg object-cover bg-black/40 border border-white/10"
                    loading="lazy"
                  />
                </td>
                <td class="px-3 py-2 align-top text-white/85">
                  <div class="space-y-1">
                    <p class="text-xs font-semibold">{item.title}</p>
                    <p class="text-[10px] text-white/40">ID: {item.id}</p>
                  </div>
                </td>
                <td class="px-3 py-2 align-top">
                  <span class={`inline-flex rounded-full px-2 py-0.5 border text-[10px] font-semibold ${typeBadgeClass(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td class="px-3 py-2 align-top text-white/60 max-w-[260px] truncate">
                  {item.clickUrl || "-"}
                </td>
                <td class="px-3 py-2 align-top text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                      onclick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 disabled:opacity-50"
                      onclick={() => deleteBanner(item)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </section>
</section>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-4 w-full max-w-xl">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold text-white">
            {editingBanner ? "Edit Banner" : "Tambah Banner"}
          </h2>
          <p class="text-[11px] text-white/40">
            Kelola banner slider homepage atau popup promo.
          </p>
        </div>
        <button
          type="button"
          class="text-xs text-white/50 hover:text-white"
          onclick={() => (showModal = false)}
        >
          Tutup
        </button>
      </div>

      <div class="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
        <label class="flex flex-col gap-1">
          <span class="text-white/70">Judul banner</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.title}
            placeholder="Contoh: Promo Diamond MLBB"
          />
        </label>

        <ImageUrlField
          label="Image URL"
          bind:value={form.imageUrl}
          placeholder="https://..."
          help="Bisa pilih/upload dari image manager atau paste manual."
        />

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Type banner</span>
          <select
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.type}
          >
            <option value="banner">banner (slider homepage)</option>
            <option value="popup">popup</option>
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Click URL</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.clickUrl}
            placeholder="https://... atau kosongkan"
          />
          <span class="text-[10px] text-white/40">
            Optional. Kalau diisi, banner bisa diklik dan buka link baru.
          </span>
        </label>

        {#if form.imageUrl}
          <div class="space-y-2">
            <p class="text-white/70">Preview</p>
            <img
              src={form.imageUrl}
              alt={form.title || "Banner preview"}
              class="w-full h-44 rounded-xl object-cover bg-black/40 border border-white/10"
            />
          </div>
        {/if}
      </div>

      <div class="flex justify-end gap-2 pt-1 text-xs">
        <button
          class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          type="button"
          onclick={() => (showModal = false)}
        >
          Batal
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740] disabled:opacity-50"
          type="button"
          onclick={submitBanner}
          disabled={saving}
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  </div>
{/if}
