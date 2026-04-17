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

  const token = $state<string | null>(null);

  // modal CRUD
  let showCategoryModal = $state(false);
  let showSubModal = $state(false);

  let editingCategory = $state<Category | null>(null);
  let editingSub = $state<SubCategory | null>(null);
  let parentCategoryForSub = $state<Category | null>(null);

  // Input Types state
  let inputTypes = $state<any[]>([]);
  let editingInputType = $state<any | null>(null);
  let activeTab = $state<'info' | 'inputs'>('info');

  // Input Types form state (for create)
  let newInputName = $state('');
  let newInputLabel = $state('');
  let newInputType = $state('text');
  let newInputModel = $state('input');
  let newInputPlaceholder = $state('');
  let newInputIcon = $state('');
  let newInputOptionLabel = $state('');
  let newInputOptionValue = $state('');
  let newInputOptionsList = $state<{label: string, value: string}[]>([]);
  let newInputMasking = $state(false);

  const catForm = $state({ title: "" });
  const subForm = $state({
    title: "",
    thumbnail: "",
    description: "",
    banners: "",
    brand: "",
    badgeId: "",
  });

  // ===========================
  // REORDER STATE
  // ===========================

  // popup reorder kategori
  let showReorderCatModal = $state(false);
  let reorderCatList = $state<Category[]>([]);
  let reorderCatDragSrc = $state<number | null>(null);
  let reorderCatDragOver = $state<number | null>(null);
  let savingReorderCat = $state(false);

  // popup reorder sub kategori
  let showReorderSubModal = $state(false);
  // step: 'pick' = pilih kategori dulu, 'sort' = drag sub
  let reorderSubStep = $state<"pick" | "sort">("pick");
  let reorderSubSelectedCat = $state<Category | null>(null);
  let reorderSubList = $state<SubCategory[]>([]);
  let reorderSubDragSrc = $state<number | null>(null);
  let reorderSubDragOver = $state<number | null>(null);
  let savingReorderSub = $state(false);

  // ===========================
  // FETCH
  // ===========================

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
      if (!res.ok) throw new Error(json?.data?.message ?? "Gagal memuat badge");
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
      if (!res.ok)
        throw new Error(json?.data?.message ?? "Gagal memuat kategori");
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

  // ===========================
  // REORDER KATEGORI — handlers
  // ===========================

  function openReorderCat() {
    reorderCatList = [...categories];
    reorderCatDragSrc = null;
    reorderCatDragOver = null;
    showReorderCatModal = true;
  }

  function catDragStart(e: DragEvent, i: number) {
    reorderCatDragSrc = i;
    e.dataTransfer!.effectAllowed = "move";
  }

  function catDragOver(e: DragEvent, i: number) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
    reorderCatDragOver = i;
  }

  function catDragLeave(i: number) {
    if (reorderCatDragOver === i) reorderCatDragOver = null;
  }

  function catDrop(e: DragEvent, targetI: number) {
    e.preventDefault();
    if (reorderCatDragSrc === null || reorderCatDragSrc === targetI) {
      reorderCatDragSrc = null;
      reorderCatDragOver = null;
      return;
    }
    const list = [...reorderCatList];
    const [moved] = list.splice(reorderCatDragSrc, 1);
    list.splice(targetI, 0, moved);
    reorderCatList = list;
    reorderCatDragSrc = null;
    reorderCatDragOver = null;
  }

  function catDragEnd() {
    reorderCatDragSrc = null;
    reorderCatDragOver = null;
  }

  async function saveReorderCat() {
    savingReorderCat = true;
    try {
      const res = await fetch("/api/v1/category/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: reorderCatList.map((cat, i) => ({ id: cat.id, position: i })),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message ?? "Gagal menyimpan urutan");
      }
      // update local tanpa refetch
      categories = [...reorderCatList];
      showReorderCatModal = false;
    } catch (e: any) {
      error = e?.message;
    } finally {
      savingReorderCat = false;
    }
  }

  // ===========================
  // REORDER SUB KATEGORI — handlers
  // ===========================

  function openReorderSub() {
    reorderSubStep = "pick";
    reorderSubSelectedCat = null;
    reorderSubList = [];
    reorderSubDragSrc = null;
    reorderSubDragOver = null;
    showReorderSubModal = true;
  }

  function pickCatForSub(cat: Category) {
    reorderSubSelectedCat = cat;
    reorderSubList = [...(cat.subCategories ?? [])];
    reorderSubDragSrc = null;
    reorderSubDragOver = null;
    reorderSubStep = "sort";
  }

  function subDragStart(e: DragEvent, i: number) {
    reorderSubDragSrc = i;
    e.dataTransfer!.effectAllowed = "move";
  }

  function subDragOver(e: DragEvent, i: number) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "move";
    reorderSubDragOver = i;
  }

  function subDragLeave(i: number) {
    if (reorderSubDragOver === i) reorderSubDragOver = null;
  }

  function subDrop(e: DragEvent, targetI: number) {
    e.preventDefault();
    if (reorderSubDragSrc === null || reorderSubDragSrc === targetI) {
      reorderSubDragSrc = null;
      reorderSubDragOver = null;
      return;
    }
    const list = [...reorderSubList];
    const [moved] = list.splice(reorderSubDragSrc, 1);
    list.splice(targetI, 0, moved);
    reorderSubList = list;
    reorderSubDragSrc = null;
    reorderSubDragOver = null;
  }

  function subDragEnd() {
    reorderSubDragSrc = null;
    reorderSubDragOver = null;
  }

  async function saveReorderSub() {
    if (!reorderSubSelectedCat) return;
    savingReorderSub = true;
    try {
      const res = await fetch(
        `/api/v1/category/sub/reorder/${reorderSubSelectedCat.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: reorderSubList.map((sub, i) => ({
              id: sub.id,
              position: i,
            })),
          }),
        },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message ?? "Gagal menyimpan urutan sub kategori");
      }
      // update local
      categories = categories.map((cat) =>
        cat.id === reorderSubSelectedCat!.id
          ? { ...cat, subCategories: [...reorderSubList] }
          : cat,
      );
      showReorderSubModal = false;
    } catch (e: any) {
      error = e?.message;
    } finally {
      savingReorderSub = false;
    }
  }

  // ===========================
  // CRUD — kategori
  // ===========================

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
    activeTab = 'info';
    inputTypes = [];
    editingInputType = null;
    showSubModal = true;
  }

  async function openEditSub(cat: Category, sub: SubCategory) {
    editingSub = sub;
    parentCategoryForSub = cat;
    subForm.title = sub.title ?? "";
    subForm.thumbnail = sub.thumbnail ?? "";
    subForm.description = sub.description ?? "";
    subForm.banners = (sub.banners ?? []).join("\n");
    subForm.brand = sub.brand ?? "";
    subForm.badgeId = sub.badgeId ? String(sub.badgeId) : "";
    activeTab = 'info';
    inputTypes = [];
    editingInputType = null;
    showSubModal = true;
    await fetchInputTypes(sub.id);
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
      if (!res.ok)
        throw new Error(json?.data?.message ?? "Gagal menyimpan kategori");
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
      if (!res.ok)
        throw new Error(json?.data?.message ?? "Gagal menyimpan sub kategori");
      showSubModal = false;
      await fetchCategories();
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan sub kategori");
    } finally {
      loading = false;
    }
  }

  // Input Types functions
  async function fetchInputTypes(subCategoryId: string) {
    try {
      const res = await fetch(`/api/v1/input-types?subCategoryId=${subCategoryId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch input types');
      const json = await res.json();
      inputTypes = json.data || [];
    } catch (e) {
      console.error(e);
      inputTypes = [];
    }
  }

  async function saveInputType(data: any) {
    const isEdit = !!editingInputType;
    const url = isEdit ? `/api/v1/input-types/${editingInputType.id}` : '/api/v1/input-types';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...data, subCategoryId: editingSub?.id }),
      });
      if (!res.ok) throw new Error('Failed to save input type');
      const json = await res.json();
      if (isEdit) {
        inputTypes = inputTypes.map(it => it.id === editingInputType.id ? json.data : it);
      } else {
        inputTypes = [...inputTypes, json.data];
      }
      editingInputType = null;
    } catch (e) {
      alert(e?.message ?? 'Gagal menyimpan input type');
    }
  }

  async function deleteInputType(id: number) {
    if (!confirm('Hapus input type?')) return;
    try {
      const res = await fetch(`/api/v1/input-types/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete');
      inputTypes = inputTypes.filter(it => it.id !== id);
    } catch (e) {
      alert(e?.message ?? 'Gagal menghapus input type');
    }
  }

  async function saveInputTypeForm() {
    try {
      const data: any = {
        name: editingInputType ? editingInputType.name : newInputName.trim(),
        label: editingInputType ? editingInputType.label : newInputLabel.trim(),
        type: editingInputType ? editingInputType.type : newInputType,
        model: editingInputType ? editingInputType.model : newInputModel,
        placeholder: editingInputType ? editingInputType.placeholder : newInputPlaceholder.trim() || null,
        icon: editingInputType ? editingInputType.icon : newInputIcon.trim() || null,
        maskingForView: editingInputType ? editingInputType.maskingForView : newInputMasking,
      };
      // Options handling for select model
      let options = null;
      if (data.model === 'select') {
        // Use existing options if editing, otherwise use newInputOptionsList
        options = editingInputType ? editingInputType.options : newInputOptionsList;
        if (!options || !Array.isArray(options) || options.length === 0) {
          options = null;
        }
      }
      data.options = options;

      await saveInputType(data);

      // Reset form
      if (!editingInputType) {
        newInputName = '';
        newInputLabel = '';
        newInputType = 'text';
        newInputModel = 'input';
        newInputPlaceholder = '';
        newInputIcon = '';
        newInputOptionLabel = '';
        newInputOptionValue = '';
        newInputOptionsList = [];
        newInputMasking = false;
      }
    } catch (e) {
      alert(e?.message ?? 'Failed to save input type');
    }
  }

  function addOptionToList() {
    if (!newInputOptionLabel.trim() || !newInputOptionValue.trim()) {
      alert('Label dan Value harus diisi');
      return;
    }
    const newOption = { label: newInputOptionLabel.trim(), value: newInputOptionValue.trim() };
    if (editingInputType) {
      if (!editingInputType.options) editingInputType.options = [];
      editingInputType.options = [...editingInputType.options, newOption];
    } else {
      newInputOptionsList = [...newInputOptionsList, newOption];
    }
    newInputOptionLabel = '';
    newInputOptionValue = '';
  }

  async function handleDeleteCategory(cat: Category) {
    const confirmed = window.confirm(
      `Yakin mau hapus kategori "${cat.title}" beserta semua sub kategorinya?`,
    );
    if (!confirmed) return;
    deletingCategoryId = cat.id;
    error = null;
    try {
      const res = await fetch(`/api/v1/category/${cat.id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal menghapus kategori",
        );
      categories = categories.filter((item) => item.id !== cat.id);
    } catch (e: any) {
      error = e?.message ?? "Gagal menghapus kategori";
    } finally {
      deletingCategoryId = null;
    }
  }

  async function handleDeleteSub(sub: SubCategory) {
    const confirmed = window.confirm(
      `Yakin mau hapus sub kategori "${sub.title}"?`,
    );
    if (!confirmed) return;
    deletingSubId = sub.id;
    error = null;
    try {
      const res = await fetch(`/api/v1/category/sub/${sub.id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          json?.data?.message ??
            json?.message ??
            "Gagal menghapus sub kategori",
        );
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

<!-- ========================= -->
<!-- MAIN PAGE -->
<!-- ========================= -->
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
    <div class="flex items-center gap-2 text-xs flex-wrap justify-end">
      <button
        type="button"
        class="px-3 py-2 rounded-lg font-semibold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
        onclick={openReorderSub}
      >
        Reorder Sub Kategori
      </button>
      <button
        type="button"
        class="px-3 py-2 rounded-lg font-semibold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
        onclick={openReorderCat}
      >
        Reorder Kategori
      </button>
      <button
        type="button"
        class="px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
        onclick={openCreateCategory}
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
      {#each categories as cat (cat.id)}
        <article
          class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden"
        >
          <header
            class="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/5"
          >
            <div class="space-y-0.5 text-xs flex-1 min-w-0">
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
                onclick={() => openEditCategory(cat)}
              >
                Edit Kategori
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 disabled:opacity-50"
                disabled={deletingCategoryId === cat.id}
                onclick={() => handleDeleteCategory(cat)}
              >
                {deletingCategoryId === cat.id ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </header>

          <div class="px-4 py-3">
            <div class="flex items-center justify-between mb-2 text-xs">
              <p class="text-white/60">
                Sub Kategori
                <span class="text-white/40"
                  >({cat.subCategories?.length ?? 0})</span
                >
              </p>
              <button
                type="button"
                class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                onclick={() => openCreateSub(cat)}
              >
                + Tambah Sub Kategori
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-[11px]">
                <thead class="bg-white/5">
                  <tr>
                    <th class="px-3 py-2 font-semibold text-white/60"
                      >Sub Kategori</th
                    >
                    <th class="px-3 py-2 font-semibold text-white/60">Brand</th>
                    <th class="px-3 py-2 font-semibold text-white/60"
                      >Instant</th
                    >
                    <th class="px-3 py-2 font-semibold text-white/60"
                      >Popular</th
                    >
                    <th class="px-3 py-2 font-semibold text-white/60">Slug</th>
                    <th class="px-3 py-2 font-semibold text-white/60 text-right"
                      >Aksi</th
                    >
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
                        <td class="px-3 py-2 align-top text-white/60"
                          >{sub.slug}</td
                        >
                        <td class="px-3 py-2 align-top text-right">
                          <div class="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                              onclick={() => openEditSub(cat, sub)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 disabled:opacity-50"
                              disabled={deletingSubId === sub.id}
                              onclick={() => handleDeleteSub(sub)}
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

<!-- ========================= -->
<!-- POPUP: REORDER KATEGORI   -->
<!-- ========================= -->
{#if showReorderCatModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-3 w-full max-w-sm mx-4"
    >
      <!-- header -->
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="text-sm font-semibold text-white">Reorder Kategori</h2>
          <p class="text-[11px] text-white/40 mt-0.5">
            Drag untuk ubah urutan, lalu simpan.
          </p>
        </div>
        <button
          class="text-xs text-white/50 hover:text-white shrink-0"
          onclick={() => (showReorderCatModal = false)}
        >
          Tutup
        </button>
      </div>

      <!-- list -->
      <div class="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {#each reorderCatList as cat, i (cat.id)}
          <div
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-100 cursor-grab active:cursor-grabbing
              {reorderCatDragSrc === i
              ? 'opacity-40 border-white/5 bg-white/[0.02]'
              : reorderCatDragOver === i && reorderCatDragSrc !== i
                ? 'border-[var(--color-primary)]/60 bg-[var(--color-primary)]/5'
                : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'}
            "
            draggable="true"
            ondragstart={(e) => catDragStart(e, i)}
            ondragover={(e) => catDragOver(e, i)}
            ondragleave={() => catDragLeave(i)}
            ondrop={(e) => catDrop(e, i)}
            ondragend={catDragEnd}
          >
            <!-- handle icon -->
            <span
              class="text-white/30 select-none text-sm leading-none shrink-0"
              >⠿</span
            >
            <!-- nomor urut -->
            <span class="text-[10px] text-white/30 w-4 shrink-0 text-center"
              >{i + 1}</span
            >
            <!-- nama -->
            <span class="text-xs font-medium text-white flex-1 truncate"
              >{cat.title}</span
            >
            <!-- sub count -->
            <span class="text-[10px] text-white/30 shrink-0">
              {cat.subCategories?.length ?? 0} sub
            </span>
          </div>
        {/each}
      </div>

      <!-- footer -->
      <div class="flex justify-end gap-2 pt-1 text-xs">
        <button
          class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          type="button"
          onclick={() => (showReorderCatModal = false)}
        >
          Batal
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740] disabled:opacity-50"
          type="button"
          onclick={saveReorderCat}
          disabled={savingReorderCat}
        >
          {savingReorderCat ? "Menyimpan..." : "Simpan Urutan"}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ========================= -->
<!-- POPUP: REORDER SUB        -->
<!-- ========================= -->
{#if showReorderSubModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-3 w-full max-w-sm mx-4"
    >
      {#if reorderSubStep === "pick"}
        <!-- STEP 1: pilih kategori -->
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-semibold text-white">
              Reorder Sub Kategori
            </h2>
            <p class="text-[11px] text-white/40 mt-0.5">
              Pilih kategori terlebih dahulu.
            </p>
          </div>
          <button
            class="text-xs text-white/50 hover:text-white shrink-0"
            onclick={() => (showReorderSubModal = false)}
          >
            Tutup
          </button>
        </div>

        <div class="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {#each categories as cat (cat.id)}
            <button
              type="button"
              class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 transition-all text-left"
              onclick={() => pickCatForSub(cat)}
            >
              <span class="text-xs font-medium text-white truncate"
                >{cat.title}</span
              >
              <span class="text-[10px] text-white/30 shrink-0">
                {cat.subCategories?.length ?? 0} sub →
              </span>
            </button>
          {/each}
        </div>
      {:else}
        <!-- STEP 2: drag sub -->
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-semibold text-white">
              Reorder Sub Kategori
            </h2>
            <p class="text-[11px] text-white/40 mt-0.5">
              {reorderSubSelectedCat?.title} · drag untuk ubah urutan.
            </p>
          </div>
          <button
            class="text-xs text-white/50 hover:text-white shrink-0"
            onclick={() => (showReorderSubModal = false)}
          >
            Tutup
          </button>
        </div>

        <!-- back -->
        <button
          type="button"
          class="text-[11px] text-white/40 hover:text-white/70 flex items-center gap-1"
          onclick={() => {
            reorderSubStep = "pick";
          }}
        >
          ← Ganti kategori
        </button>

        <div class="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
          {#if !reorderSubList.length}
            <p class="text-xs text-white/40 text-center py-4">
              Belum ada sub kategori.
            </p>
          {:else}
            {#each reorderSubList as sub, i (sub.id)}
              <div
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-100 cursor-grab active:cursor-grabbing
                  {reorderSubDragSrc === i
                  ? 'opacity-40 border-white/5 bg-white/[0.02]'
                  : reorderSubDragOver === i && reorderSubDragSrc !== i
                    ? 'border-[var(--color-primary)]/60 bg-[var(--color-primary)]/5'
                    : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'}
                "
                draggable="true"
                ondragstart={(e) => subDragStart(e, i)}
                ondragover={(e) => subDragOver(e, i)}
                ondragleave={() => subDragLeave(i)}
                ondrop={(e) => subDrop(e, i)}
                ondragend={subDragEnd}
              >
                <span
                  class="text-white/30 select-none text-sm leading-none shrink-0"
                  >⠿</span
                >
                <span class="text-[10px] text-white/30 w-4 shrink-0 text-center"
                  >{i + 1}</span
                >
                {#if sub.thumbnail}
                  <img
                    src={sub.thumbnail}
                    alt={sub.title}
                    class="w-6 h-6 rounded object-cover shrink-0"
                  />
                {/if}
                <span class="text-xs font-medium text-white flex-1 truncate"
                  >{sub.title}</span
                >
              </div>
            {/each}
          {/if}
        </div>

        <div class="flex justify-end gap-2 pt-1 text-xs">
          <button
            class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
            type="button"
            onclick={() => (showReorderSubModal = false)}
          >
            Batal
          </button>
          <button
            class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740] disabled:opacity-50"
            type="button"
            onclick={saveReorderSub}
            disabled={savingReorderSub || !reorderSubList.length}
          >
            {savingReorderSub ? "Menyimpan..." : "Simpan Urutan"}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- ========================= -->
<!-- POPUP: CRUD KATEGORI      -->
<!-- ========================= -->
{#if showCategoryModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-3 w-full max-w-[480px] mx-4"
    >
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-semibold text-white">
          {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
        </h2>
        <button
          class="text-xs text-white/50 hover:text-white"
          onclick={() => (showCategoryModal = false)}
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
          onclick={() => (showCategoryModal = false)}
        >
          Batal
        </button>
        <button
          class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
          type="button"
          onclick={submitCategory}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ========================= -->
<!-- POPUP: CRUD SUB KATEGORI  -->
<!-- ========================= -->
{#if showSubModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
  >
    <div
      class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-3 w-full max-w-[480px] mx-4"
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
          onclick={() => (showSubModal = false)}
        >
          Tutup
        </button>
      </div>
      <!-- Tab Navigation -->
      <div class="flex border-b border-white/10 mb-4">
        <button
          class={`px-4 py-2 text-xs font-medium ${activeTab === 'info' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-white/50 hover:text-white'}`}
          onclick={() => activeTab = 'info'}
        >
          Informasi
        </button>
        <button
          class={`px-4 py-2 text-xs font-medium ${activeTab === 'inputs' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-white/50 hover:text-white'}`}
          onclick={() => activeTab = 'inputs'}
        >
          Input Types
        </button>
      </div>

      {#if activeTab === 'info'}
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
            onclick={() => (showSubModal = false)}
          >
            Batal
          </button>
          <button
            class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
            type="button"
            onclick={submitSub}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      {:else if activeTab === 'inputs'}
        <div class="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div class="text-xs text-white/50">
            Konfigurasi input fields yang akan muncul di halaman order untuk sub kategori ini.
            Jika tidak ada input types, order page akan fallback ke <code class="bg-white/5 px-1 rounded">/api/v1/games/supported</code>.
          </div>

          <!-- List Input Types -->
          <div class="space-y-2">
            {#each inputTypes as input}
              <div class="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-white">{input.label}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">{input.name}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">{input.type}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">{input.model}</span>
                    {#if input.maskingForView}
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">mask</span>
                    {/if}
                  </div>
                  {#if input.placeholder}
                    <div class="text-[10px] text-white/40 mt-1">Placeholder: {input.placeholder}</div>
                  {/if}
                  {#if input.icon}
                    <div class="text-[10px] text-white/40 mt-1">Icon: {input.icon}</div>
                  {/if}
                </div>
                <div class="flex items-center gap-1">
                  <button
                    class="px-2 py-1 text-xs bg-white/5 text-white/70 border border-white/10 rounded hover:bg-white/10"
                    onclick={() => { 
                      editingInputType = input; 
                      if (editingInputType.options === null || editingInputType.options === undefined) {
                        editingInputType.options = [];
                      }
                      newInputOptionLabel = '';
                      newInputOptionValue = '';
                    }}
                  >
                    Edit
                  </button>
                  <button
                    class="px-2 py-1 text-xs bg-red-500/10 text-red-300 border border-red-500/20 rounded hover:bg-red-500/20"
                    onclick={() => deleteInputType(input.id)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            {:else}
              <div class="p-4 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-lg">
                Belum ada input types.
              </div>
            {/each}
          </div>

          <!-- Form Input Type -->
          <div class="pt-4 border-t border-white/10">
            <h3 class="text-xs font-semibold text-white mb-3">
              {editingInputType ? 'Edit Input Type' : 'Tambah Input Type'}
            </h3>
            <div class="space-y-2 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <label class="flex flex-col gap-1">
                  <span class="text-white/70">Name *</span>
                  <input
                    class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
                    bind:value={editingInputType ? editingInputType.name : newInputName}
                    placeholder="server_id"
                  />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-white/70">Label *</span>
                  <input
                    class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
                    bind:value={editingInputType ? editingInputType.label : newInputLabel}
                    placeholder="Server ID"
                  />
                </label>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex flex-col gap-1">
                  <span class="text-white/70">Type</span>
                  <select
                    class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
                    bind:value={editingInputType ? editingInputType.type : newInputType}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="tel">Telephone</option>
                    <option value="email">Email</option>
                    <option value="password">Password</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-white/70">Model</span>
                  <select
                    class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
                    bind:value={editingInputType ? editingInputType.model : newInputModel}
                  >
                    <option value="input">Input</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                  </select>
                </label>
              </div>
              <label class="flex flex-col gap-1">
                <span class="text-white/70">Placeholder</span>
                <input
                  class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
                  bind:value={editingInputType ? editingInputType.placeholder : newInputPlaceholder}
                  placeholder="Masukkan server ID"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-white/70">Icon (optional)</span>
                <input
                  class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
                  bind:value={editingInputType ? editingInputType.icon : newInputIcon}
                  placeholder="mdi:server"
                />
              </label>
              {#if (editingInputType ? editingInputType.model : newInputModel) === 'select'}
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-white/70">Options (untuk select)</span>
                    <span class="text-[10px] text-white/40">Tambah pasangan label & value</span>
                  </div>
                  
                  <!-- List options -->
                  <div class="space-y-1 max-h-40 overflow-y-auto border border-white/10 rounded-lg p-2">
                    {#each (editingInputType ? editingInputType.options : newInputOptionsList) as opt, i}
                      <div class="flex items-center gap-2 p-2 bg-white/5 rounded">
                        <div class="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            class="px-2 py-1 text-xs bg-black/40 border border-white/10 text-white rounded"
                            bind:value={opt.label}
                            placeholder="Label"
                          />
                          <input
                            type="text"
                            class="px-2 py-1 text-xs bg-black/40 border border-white/10 text-white rounded"
                            bind:value={opt.value}
                            placeholder="Value"
                          />
                        </div>
                        <button
                          type="button"
                          class="px-2 py-1 text-xs bg-red-500/10 text-red-300 border border-red-500/20 rounded hover:bg-red-500/20"
                          onclick={() => {
                            if (editingInputType) {
                              editingInputType.options = editingInputType.options.filter((_, idx) => idx !== i);
                            } else {
                              newInputOptionsList = newInputOptionsList.filter((_, idx) => idx !== i);
                            }
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    {:else}
                      <div class="text-center text-white/40 text-xs py-4">Belum ada options.</div>
                    {/each}
                  </div>
                  
                  <!-- Add new option -->
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
                      bind:value={newInputOptionLabel}
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
                      bind:value={newInputOptionValue}
                      placeholder="Value"
                    />
                  </div>
                  <button
                    type="button"
                    class="w-full px-3 py-2 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 text-xs"
                    onclick={addOptionToList}
                  >
                    + Tambah Option
                  </button>
                </div>
              {/if}
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  class="rounded border-white/10 bg-black/40"
                  bind:checked={editingInputType ? editingInputType.maskingForView : newInputMasking}
                />
                <span class="text-white/70">Masking for view (tampilkan sebagai ***)</span>
              </label>
              <div class="flex justify-end gap-2 pt-2">
                {#if editingInputType}
                  <button
                    class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                    onclick={() => editingInputType = null}
                  >
                    Batal Edit
                  </button>
                {/if}
                <button
                  class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
                  onclick={saveInputTypeForm}
                >
                  {editingInputType ? 'Update' : 'Tambah'}
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
