<script lang="ts">
  type PromotionDiscType = "flat" | "percent";
  type PickerType = "product" | "user";

  type PromotionItem = {
    id: number;
    code: string;
    title: string;
    productId?: string | null;
    categoryId?: string | null;
    subCategoryId?: string | null;
    active: boolean;
    allowFlashSale: boolean;
    maxUse: number;
    used: number;
    discType: PromotionDiscType;
    value: string | number;
    minTrx?: number | null;
    maxDiscount?: number | null;
    userId?: string | null;
    expiredDate?: string | null;
    createdAt?: string;
  };

  type Category = {
    id: string;
    title: string;
    subCategories?: {
      id: string;
      title: string;
      categoryId: string;
    }[];
  };

  type ProductOption = {
    id: string;
    title: string;
    skuCode?: string | null;
  };

  type UserOption = {
    id: string;
    displayName?: string | null;
    email: string;
    role?: string | null;
  };

  type FormState = {
    code: string;
    title: string;
    productId: string;
    categoryId: string;
    subCategoryId: string;
    active: boolean;
    allowFlashSale: boolean;
    maxUse: number;
    used: number;
    discType: PromotionDiscType;
    value: number;
    minTrx: number;
    maxDiscount: number;
    userId: string;
    expiredDate: string;
  };

  let promotions = $state<PromotionItem[]>([]);
  let categories = $state<Category[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let saving = $state(false);
  let deletingId = $state<number | null>(null);

  let showModal = $state(false);
  let editingPromotion = $state<PromotionItem | null>(null);

  let pickerOpen = $state(false);
  let pickerType = $state<PickerType>("product");
  let pickerSearch = $state("");
  let pickerLoading = $state(false);
  let pickerError = $state<string | null>(null);
  let productOptions = $state<ProductOption[]>([]);
  let userOptions = $state<UserOption[]>([]);

  let form = $state<FormState>({
    code: "",
    title: "",
    productId: "",
    categoryId: "",
    subCategoryId: "",
    active: true,
    allowFlashSale: false,
    maxUse: 5,
    used: 0,
    discType: "flat",
    value: 0,
    minTrx: 1000,
    maxDiscount: 0,
    userId: "",
    expiredDate: "",
  });

  const availableSubCategories = $derived(
    categories.flatMap((category) => category.subCategories ?? []),
  );

  const filteredSubCategories = $derived(
    form.categoryId
      ? availableSubCategories.filter((sub) => sub.categoryId === form.categoryId)
      : availableSubCategories,
  );

  const selectedProduct = $derived(
    productOptions.find((item) => item.id === form.productId) ?? null,
  );

  const selectedUser = $derived(
    userOptions.find((item) => item.id === form.userId) ?? null,
  );

  function resetForm() {
    form.code = "";
    form.title = "";
    form.productId = "";
    form.categoryId = "";
    form.subCategoryId = "";
    form.active = true;
    form.allowFlashSale = false;
    form.maxUse = 5;
    form.used = 0;
    form.discType = "flat";
    form.value = 0;
    form.minTrx = 1000;
    form.maxDiscount = 0;
    form.userId = "";
    form.expiredDate = "";
  }

  function openCreateModal() {
    editingPromotion = null;
    resetForm();
    showModal = true;
  }

  async function openEditModal(item: PromotionItem) {
    editingPromotion = item;
    form.code = item.code ?? "";
    form.title = item.title ?? "";
    form.productId = item.productId ?? "";
    form.categoryId = item.categoryId ?? "";
    form.subCategoryId = item.subCategoryId ?? "";
    form.active = item.active ?? true;
    form.allowFlashSale = item.allowFlashSale ?? false;
    form.maxUse = Number(item.maxUse ?? 5);
    form.used = Number(item.used ?? 0);
    form.discType = item.discType ?? "flat";
    form.value = Number(item.value ?? 0);
    form.minTrx = Number(item.minTrx ?? 0);
    form.maxDiscount = Number(item.maxDiscount ?? 0);
    form.userId = item.userId ?? "";
    form.expiredDate = item.expiredDate ? String(item.expiredDate).slice(0, 16) : "";
    showModal = true;

    if (item.productId) {
      await fetchProducts(item.productId);
    }

    if (item.userId) {
      await fetchUsers(item.userId);
    }
  }

  function normalizePayload() {
    return {
      code: form.code.trim().toUpperCase(),
      title: form.title.trim(),
      productId: form.productId.trim(),
      categoryId: form.categoryId,
      subCategoryId: form.subCategoryId,
      active: form.active,
      allowFlashSale: form.allowFlashSale,
      maxUse: Number(form.maxUse || 0),
      used: Number(form.used || 0),
      discType: form.discType,
      value: Number(form.value || 0),
      minTrx: Number(form.minTrx || 0),
      maxDiscount: Number(form.maxDiscount || 0),
      userId: form.userId.trim(),
      expiredDate: form.expiredDate ? new Date(form.expiredDate).toISOString() : null,
    };
  }

  async function fetchPromotions() {
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/promotions");
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.data?.message ?? json?.message ?? "Gagal memuat promotions");
      }
      promotions = json?.data ?? [];
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat promotions";
    } finally {
      loading = false;
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/v1/category");
      const json = await res.json().catch(() => null);
      if (res.ok) {
        categories = json?.data ?? [];
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchProducts(search = "") {
    pickerLoading = true;
    pickerError = null;
    try {
      const params = new URLSearchParams();
      params.set("limit", "20");
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`/api/v1/products/list?${params.toString()}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.data?.message ?? json?.message ?? "Gagal memuat produk");
      }
      productOptions = json?.data?.items ?? [];
    } catch (e: any) {
      pickerError = e?.message ?? "Gagal memuat produk";
    } finally {
      pickerLoading = false;
    }
  }

  async function fetchUsers(search = "") {
    pickerLoading = true;
    pickerError = null;
    try {
      const params = new URLSearchParams();
      params.set("limit", "20");
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`/api/v1/users?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.data?.message ?? json?.message ?? "Gagal memuat user");
      }
      userOptions = json?.data?.items ?? json?.items ?? [];
    } catch (e: any) {
      pickerError = e?.message ?? "Gagal memuat user";
    } finally {
      pickerLoading = false;
    }
  }

  async function openPicker(type: PickerType) {
    pickerType = type;
    pickerSearch = "";
    pickerError = null;
    pickerOpen = true;

    if (type === "product") {
      await fetchProducts();
    } else {
      await fetchUsers();
    }
  }

  async function handlePickerSearch() {
    if (pickerType === "product") {
      await fetchProducts(pickerSearch);
    } else {
      await fetchUsers(pickerSearch);
    }
  }

  function pickProduct(item: ProductOption) {
    form.productId = item.id;
    if (!productOptions.some((product) => product.id === item.id)) {
      productOptions = [item, ...productOptions];
    }
    pickerOpen = false;
  }

  function pickUser(item: UserOption) {
    form.userId = item.id;
    if (!userOptions.some((user) => user.id === item.id)) {
      userOptions = [item, ...userOptions];
    }
    pickerOpen = false;
  }

  async function submitPromotion() {
    const payload = normalizePayload();

    if (!payload.code || !payload.title) {
      alert("Kode promo dan judul wajib diisi");
      return;
    }

    saving = true;
    error = null;

    const isEdit = !!editingPromotion;
    const url = isEdit
      ? `/api/v1/promotions/${editingPromotion!.id}`
      : "/api/v1/promotions";
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
          json?.data?.message ?? json?.message ?? "Gagal menyimpan promotion",
        );
      }

      showModal = false;
      resetForm();
      await fetchPromotions();
    } catch (e: any) {
      error = e?.message ?? "Gagal menyimpan promotion";
      alert(error);
    } finally {
      saving = false;
    }
  }

  async function deletePromotion(item: PromotionItem) {
    const confirmed = window.confirm(`Yakin mau hapus promo \"${item.title}\"?`);
    if (!confirmed) return;

    deletingId = item.id;
    error = null;

    try {
      const res = await fetch(`/api/v1/promotions/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal menghapus promotion",
        );
      }
      promotions = promotions.filter((promotion) => promotion.id !== item.id);
    } catch (e: any) {
      error = e?.message ?? "Gagal menghapus promotion";
    } finally {
      deletingId = null;
    }
  }

  function formatCurrency(value: string | number | null | undefined) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
  }

  function formatDate(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("id-ID");
  }

  $effect(() => {
    fetchPromotions();
    fetchCategories();
  });
</script>

<section class="space-y-6">
  <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div>
      <p class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1">
        Promotion Management
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Manajemen Promotion Code
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Kelola kode promo, diskon flat atau persen, batas penggunaan, dan target promo dari dashboard admin.
      </p>
    </div>

    <button
      type="button"
      class="px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740] text-xs"
      onclick={openCreateModal}
    >
      + Tambah Promotion
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
        <h2 class="text-sm font-semibold text-white">Daftar Promotion</h2>
        <p class="text-[11px] text-white/40">Atur promo aktif, diskon, usage, dan expired date dari sini.</p>
      </div>
      <button
        type="button"
        class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
        onclick={fetchPromotions}
        disabled={loading}
      >
        {loading ? "Memuat..." : "Refresh"}
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-[11px]">
        <thead class="bg-white/5">
          <tr>
            <th class="px-3 py-2 font-semibold text-white/60">Code</th>
            <th class="px-3 py-2 font-semibold text-white/60">Promo</th>
            <th class="px-3 py-2 font-semibold text-white/60">Diskon</th>
            <th class="px-3 py-2 font-semibold text-white/60">Limit</th>
            <th class="px-3 py-2 font-semibold text-white/60">Target</th>
            <th class="px-3 py-2 font-semibold text-white/60">Expired</th>
            <th class="px-3 py-2 font-semibold text-white/60 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#if loading && !promotions.length}
            <tr>
              <td colspan="7" class="px-3 py-6 text-center text-white/40">Memuat data promotion...</td>
            </tr>
          {:else if !promotions.length}
            <tr>
              <td colspan="7" class="px-3 py-6 text-center text-white/40">Belum ada promotion.</td>
            </tr>
          {:else}
            {#each promotions as item}
              <tr class="border-t border-white/5 hover:bg-white/[0.03]">
                <td class="px-3 py-2 align-top text-white/85 font-semibold">{item.code}</td>
                <td class="px-3 py-2 align-top text-white/85">
                  <div class="space-y-1">
                    <p class="text-xs font-semibold">{item.title}</p>
                    <div class="flex flex-wrap gap-1 text-[10px]">
                      <span class={`inline-flex rounded-full px-2 py-0.5 border ${item.active ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40" : "bg-white/5 text-white/50 border-white/10"}`}>
                        {item.active ? "active" : "inactive"}
                      </span>
                      <span class={`inline-flex rounded-full px-2 py-0.5 border ${item.allowFlashSale ? "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/40" : "bg-white/5 text-white/50 border-white/10"}`}>
                        {item.allowFlashSale ? "flash sale ok" : "flash sale off"}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-2 align-top text-white/70">
                  <div>{item.discType === "percent" ? `${item.value}%` : formatCurrency(item.value)}</div>
                  <div class="text-[10px] text-white/35">Min trx: {formatCurrency(item.minTrx)}</div>
                  <div class="text-[10px] text-white/35">Max disc: {item.maxDiscount ? formatCurrency(item.maxDiscount) : "-"}</div>
                </td>
                <td class="px-3 py-2 align-top text-white/70">
                  <div>{item.used} / {item.maxUse}</div>
                </td>
                <td class="px-3 py-2 align-top text-white/60 max-w-[220px]">
                  <div class="space-y-1">
                    <p>Product: {item.productId || "all"}</p>
                    <p>Category: {item.categoryId || "all"}</p>
                    <p>Sub: {item.subCategoryId || "all"}</p>
                    <p>User: {item.userId || "all"}</p>
                  </div>
                </td>
                <td class="px-3 py-2 align-top text-white/60">
                  {formatDate(item.expiredDate)}
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
                      onclick={() => deletePromotion(item)}
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
    <div class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold text-white">
            {editingPromotion ? "Edit Promotion" : "Tambah Promotion"}
          </h2>
          <p class="text-[11px] text-white/40">
            Atur kode promo, cakupan promo, dan batas penggunaannya.
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

      <div class="grid gap-3 md:grid-cols-2 text-xs">
        <label class="flex flex-col gap-1">
          <span class="text-white/70">Kode Promo</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.code}
            placeholder="WELCOME10"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Judul Promo</span>
          <input
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.title}
            placeholder="Promo pengguna baru"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Disc Type</span>
          <select
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.discType}
          >
            <option value="flat">flat</option>
            <option value="percent">percent</option>
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Nilai Diskon</span>
          <input
            type="number"
            min="0"
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.value}
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Max Use</span>
          <input
            type="number"
            min="1"
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.maxUse}
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Used</span>
          <input
            type="number"
            min="0"
            class="px-3 py-2 rounded-lg bg-black/40 border border:white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.used}
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Minimum Transaksi</span>
          <input
            type="number"
            min="0"
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.minTrx}
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Maximum Discount</span>
          <input
            type="number"
            min="0"
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.maxDiscount}
          />
        </label>

        <div class="flex flex-col gap-1 md:col-span-2">
          <span class="text-white/70">Product ID (opsional)</span>
          <div class="flex gap-2">
            <input
              class="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
              bind:value={form.productId}
              placeholder="Isi kalau promo khusus product tertentu"
            />
            <button
              type="button"
              class="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
              onclick={() => openPicker("product")}
            >
              Pick Produk
            </button>
            {#if form.productId}
              <button
                type="button"
                class="px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20"
                onclick={() => (form.productId = "")}
              >
                Clear
              </button>
            {/if}
          </div>
          {#if selectedProduct}
            <p class="text-[11px] text-white/45">
              Terpilih: <span class="text-white/70">{selectedProduct.title}</span> ({selectedProduct.id})
            </p>
          {/if}
        </div>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Kategori (opsional)</span>
          <select
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.categoryId}
            onchange={() => {
              if (form.subCategoryId) {
                const stillExists = filteredSubCategories.some((sub) => sub.id === form.subCategoryId);
                if (!stillExists) form.subCategoryId = "";
              }
            }}
          >
            <option value="">Semua kategori</option>
            {#each categories as category}
              <option value={category.id}>{category.title}</option>
            {/each}
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Sub Kategori (opsional)</span>
          <select
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.subCategoryId}
          >
            <option value="">Semua sub kategori</option>
            {#each filteredSubCategories as sub}
              <option value={sub.id}>{sub.title}</option>
            {/each}
          </select>
        </label>

        <div class="flex flex-col gap-1">
          <span class="text-white/70">User ID (opsional)</span>
          <div class="flex gap-2">
            <input
              class="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
              bind:value={form.userId}
              placeholder="Kosongkan kalau semua user bisa pakai"
            />
            <button
              type="button"
              class="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
              onclick={() => openPicker("user")}
            >
              Pick User
            </button>
          </div>
          {#if selectedUser}
            <p class="text-[11px] text-white/45">
              Terpilih: <span class="text-white/70">{selectedUser.displayName || selectedUser.email}</span> ({selectedUser.id})
            </p>
          {/if}
        </div>

        <label class="flex flex-col gap-1">
          <span class="text-white/70">Expired Date (opsional)</span>
          <input
            type="datetime-local"
            class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
            bind:value={form.expiredDate}
          />
        </label>

        <label class="flex items-center gap-2 text-white/80 md:col-span-2">
          <input type="checkbox" class="rounded border-white/20 bg-black/60" bind:checked={form.active} />
          Promotion aktif
        </label>

        <label class="flex items-center gap-2 text-white/80 md:col-span-2">
          <input type="checkbox" class="rounded border-white/20 bg-black/60" bind:checked={form.allowFlashSale} />
          Bisa dipakai bersamaan dengan flash sale
        </label>
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
          onclick={submitPromotion}
          disabled={saving}
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if pickerOpen}
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div class="rounded-2xl bg-[#111111] border border-white/10 p-4 space-y-4 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-white">
            {pickerType === "product" ? "Pick Produk" : "Pick User"}
          </h3>
          <p class="text-[11px] text-white/40">
            Cari lalu pilih {pickerType === "product" ? "produk" : "user"} yang mau dipakai.
          </p>
        </div>
        <button
          type="button"
          class="text-xs text-white/50 hover:text-white"
          onclick={() => (pickerOpen = false)}
        >
          Tutup
        </button>
      </div>

      <div class="flex gap-2">
        <input
          class="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[var(--color-primary)]"
          bind:value={pickerSearch}
          placeholder={pickerType === "product" ? "Cari nama produk / SKU / ID" : "Cari nama user / email / ID"}
          onkeydown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handlePickerSearch();
            }
          }}
        />
        <button
          type="button"
          class="px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
          onclick={handlePickerSearch}
        >
          Cari
        </button>
      </div>

      {#if pickerError}
        <div class="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
          {pickerError}
        </div>
      {/if}

      <div class="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
        {#if pickerLoading}
          <div class="rounded-xl border border-white/10 bg-black/20 px-3 py-4 text-xs text-white/45 text-center">
            Memuat data...
          </div>
        {:else if pickerType === "product"}
          {#if !productOptions.length}
            <div class="rounded-xl border border-white/10 bg-black/20 px-3 py-4 text-xs text-white/45 text-center">
              Produk tidak ditemukan.
            </div>
          {:else}
            {#each productOptions as item}
              <button
                type="button"
                class="w-full text-left rounded-xl border border-white/10 bg-black/20 px-3 py-3 hover:bg-white/5"
                onclick={() => pickProduct(item)}
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-white">{item.title}</p>
                    <p class="text-[11px] text-white/45">ID: {item.id}</p>
                    <p class="text-[11px] text-white/45">SKU: {item.skuCode || "-"}</p>
                  </div>
                  <span class="text-[11px] font-semibold text-[var(--color-primary)]">Pilih</span>
                </div>
              </button>
            {/each}
          {/if}
        {:else}
          {#if !userOptions.length}
            <div class="rounded-xl border border-white/10 bg-black/20 px-3 py-4 text-xs text-white/45 text-center">
              User tidak ditemukan.
            </div>
          {:else}
            {#each userOptions as item}
              <button
                type="button"
                class="w-full text-left rounded-xl border border-white/10 bg-black/20 px-3 py-3 hover:bg-white/5"
                onclick={() => pickUser(item)}
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-white">{item.displayName || "Tanpa nama"}</p>
                    <p class="text-[11px] text-white/45">Email: {item.email}</p>
                    <p class="text-[11px] text-white/45">ID: {item.id}</p>
                    <p class="text-[11px] text-white/45">Role: {item.role || "-"}</p>
                  </div>
                  <span class="text-[11px] font-semibold text-[var(--color-primary)]">Pilih</span>
                </div>
              </button>
            {/each}
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}
