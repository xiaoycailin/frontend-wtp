<script lang="ts">
  import { onMount } from "svelte";

  let categories: any[] = $state([]);
  let loading = $state(true);
  let submitting = $state(false);

  let form = {
    id: "",
    name: "",
    slug: "",
    description: "",
    thumbnail: "",
  };

  async function fetchCategories() {
    loading = true;
    try {
      const res = await fetch("/api/v1/article-categories");
      const json = await res.json();
      categories = json.data?.data || json.data || [];
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  }

  onMount(fetchCategories);

  function resetForm() {
    form = { id: "", name: "", slug: "", description: "", thumbnail: "" };
  }

  function editCategory(category: any) {
    form = {
      id: category.id,
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      thumbnail: category.thumbnail || "",
    };
  }

  async function handleSubmit() {
    if (!form.name || !form.slug) {
      alert("Nama dan slug wajib diisi");
      return;
    }

    submitting = true;
    try {
      const authState = localStorage.getItem("auth");
      const jwt = authState ? JSON.parse(authState).jwt : null;
      const method = form.id ? "PUT" : "POST";
      const url = form.id
        ? `/api/v1/article-categories/${form.id}`
        : "/api/v1/article-categories";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          thumbnail: form.thumbnail || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.data?.message || "Gagal simpan kategori");
        return;
      }

      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      submitting = false;
    }
  }
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-white">Kategori Artikel</h1>
    <p class="text-sm text-white/50 mt-1">Kelola kategori khusus artikel</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div
      class="lg:col-span-1 bg-[#0b0b0b] border border-white/5 rounded-xl p-5 space-y-4"
    >
      <h2 class="text-lg font-semibold text-white">
        {form.id ? "Edit Kategori" : "Tambah Kategori"}
      </h2>
      <div>
        <label class="block text-sm text-white mb-2">Nama *</label>
        <input
          bind:value={form.name}
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white"
        />
      </div>
      <div>
        <label class="block text-sm text-white mb-2">Slug *</label>
        <input
          bind:value={form.slug}
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white"
        />
      </div>
      <div>
        <label class="block text-sm text-white mb-2">Description</label>
        <textarea
          bind:value={form.description}
          rows="3"
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm text-white mb-2">Thumbnail URL</label>
        <input
          bind:value={form.thumbnail}
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white"
        />
      </div>
      <div class="flex gap-3">
        <button
          disabled={submitting}
          onclick={handleSubmit}
          class="flex-1 px-4 py-2.5 bg-[#f5c518] text-black font-semibold rounded-lg disabled:opacity-50"
        >
          {form.id ? "Update" : "Simpan"}
        </button>
        <button onclick={resetForm} class="px-4 py-2.5 bg-white/5 rounded-lg"
          >Reset</button
        >
      </div>
    </div>

    <div
      class="lg:col-span-2 bg-[#0b0b0b] border border-white/5 rounded-xl overflow-hidden"
    >
      <table class="w-full">
        <thead class="bg-white/5">
          <tr>
            <th class="px-4 py-3 text-left text-xs text-white/60">Nama</th>
            <th class="px-4 py-3 text-left text-xs text-white/60">Slug</th>
            <th class="px-4 py-3 text-left text-xs text-white/60"
              >Description</th
            >
            <th class="px-4 py-3 text-right text-xs text-white/60">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          {#if loading}
            <tr
              ><td colspan="4" class="px-4 py-8 text-center text-white/40"
                >Loading...</td
              ></tr
            >
          {:else if categories.length === 0}
            <tr
              ><td colspan="4" class="px-4 py-8 text-center text-white/40"
                >Belum ada kategori</td
              ></tr
            >
          {:else}
            {#each categories as category}
              <tr class="hover:bg-white/5">
                <td class="px-4 py-4 text-white">{category.name}</td>
                <td class="px-4 py-4 text-white/70">{category.slug}</td>
                <td class="px-4 py-4 text-white/60"
                  >{category.description || "-"}</td
                >
                <td class="px-4 py-4 text-right">
                  <button
                    onclick={() => editCategory(category)}
                    class="text-xs text-[#f5c518]">Edit</button
                  >
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
