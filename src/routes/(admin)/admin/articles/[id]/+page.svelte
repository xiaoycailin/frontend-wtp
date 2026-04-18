<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  // ✅ Svelte 5: $app/stores → $app/state (tidak perlu subscribe manual)
  import { page } from "$app/state";

  let loading = $state(true);
  let submitting = $state(false);
  let articleId = $state("");

  let title = $state("");
  let slug = $state("");
  let content = $state("");
  let excerpt = $state("");
  let thumbnail = $state("");
  let metaTitle = $state("");
  let metaDescription = $state("");
  let metaKeywords = $state("");
  let ogImage = $state("");
  let status = $state("DRAFT");

  let categories = $state<any[]>([]);
  let selectedCategoryId = $state("");
  let tags = $state<any[]>([]);
  let selectedTags = $state<string[]>([]);

  async function fetchCategoriesAndTags() {
    const [catRes, tagRes] = await Promise.all([
      fetch("/api/v1/article-categories"),
      fetch("/api/v1/article-tags"),
    ]);

    if (catRes.ok) {
      const catData = await catRes.json();
      categories = catData.data?.data || catData.data || [];
    }

    if (tagRes.ok) {
      const tagData = await tagRes.json();
      tags = tagData.data?.data || tagData.data || [];
    }
  }

  async function fetchArticle() {
    // ✅ Svelte 5: page dari $app/state diakses langsung tanpa $
    const id = page.params.id;
    articleId = id as any;

    const res = await fetch(`/api/v1/articles/${id}`);
    if (!res.ok) {
      alert("Gagal mengambil artikel");
      goto("/admin/articles");
      return;
    }

    const json = await res.json();
    const article = json.data?.data || json.data;

    title = article.title || "";
    slug = article.slug || "";
    content = article.content || "";
    excerpt = article.excerpt || "";
    thumbnail = article.thumbnail || "";
    metaTitle = article.metaTitle || "";
    metaDescription = article.metaDescription || "";
    metaKeywords = article.metaKeywords || "";
    ogImage = article.ogImage || "";
    status = article.status || "DRAFT";
    selectedCategoryId = article.categoryId || "";
    // ✅ Reassign array baru agar $state tracking bekerja
    selectedTags = (article.tags || []).map((item: any) => item.tagId);
  }

  onMount(async () => {
    try {
      await Promise.all([fetchCategoriesAndTags(), fetchArticle()]);
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  });

  function toggleTag(tagId: string) {
    if (selectedTags.includes(tagId)) {
      selectedTags = selectedTags.filter((id) => id !== tagId);
    } else {
      selectedTags = [...selectedTags, tagId];
    }
  }

  async function handleSubmit() {
    if (!title || !slug || !content) {
      alert("Judul, slug, dan konten wajib diisi");
      return;
    }

    submitting = true;
    try {
      const res = await fetch(`/api/v1/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt: excerpt || null,
          thumbnail: thumbnail || null,
          categoryId: selectedCategoryId || null,
          status,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          metaKeywords: metaKeywords || null,
          ogImage: ogImage || null,
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.data?.message || "Gagal update artikel");
        return;
      }

      alert("Artikel berhasil diperbarui");
      goto("/admin/articles");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      submitting = false;
    }
  }
</script>

<div class="space-y-6 max-w-5xl">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-white">Edit Artikel</h1>
      <p class="text-sm text-white/50 mt-1">
        Perbarui artikel yang sudah dibuat
      </p>
    </div>
    <button
      onclick={() => goto("/admin/articles")}
      class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
    >
      Kembali
    </button>
  </div>

  {#if loading}
    <div
      class="bg-[#0b0b0b] border border-white/5 rounded-xl p-8 text-center text-white/40"
    >
      Loading...
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div
          class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5 space-y-4"
        >
          <div>
            <label class="block text-sm font-medium text-white mb-2"
              >Judul Artikel *</label
            >
            <input
              bind:value={title}
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#f5c518] focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-2">Slug</label
            >
            <input
              bind:value={slug}
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#f5c518] focus:outline-none"
            />
          </div>
        </div>

        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <label class="block text-sm font-medium text-white mb-2"
            >Konten *</label
          >
          <textarea
            bind:value={content}
            rows="16"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none font-mono text-sm focus:border-[#f5c518] focus:outline-none"
          ></textarea>
        </div>

        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <label class="block text-sm font-medium text-white mb-2"
            >Excerpt</label
          >
          <textarea
            bind:value={excerpt}
            rows="3"
            maxlength="500"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white resize-none focus:border-[#f5c518] focus:outline-none"
          ></textarea>
          <p class="text-xs text-white/40 mt-1">
            {excerpt.length}/500 karakter
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <div
          class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5 space-y-4"
        >
          <div>
            <label class="block text-sm font-medium text-white mb-2"
              >Status</label
            >
            <select
              bind:value={status}
              class="w-full px-4 py-2.5 bg-[#0b0b0b] border border-white/10 rounded-lg text-white focus:border-[#f5c518] focus:outline-none"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-2"
              >Kategori</label
            >
            <select
              bind:value={selectedCategoryId}
              class="w-full px-4 py-2.5 bg-[#0b0b0b] border border-white/10 rounded-lg text-white focus:border-[#f5c518] focus:outline-none"
            >
              <option value="">Pilih Kategori</option>
              {#each categories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <h3 class="text-sm font-semibold text-white mb-4">Tags</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            {#each tags as tag}
              <label class="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onchange={() => toggleTag(tag.id)}
                  class="w-4 h-4 rounded border-white/20 bg-white/5 text-[#f5c518] focus:ring-[#f5c518]"
                />
                <span
                  class="text-sm text-white/80 group-hover:text-white transition-colors"
                >
                  {tag.name}
                </span>
              </label>
            {/each}
          </div>
        </div>

        <div
          class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5 space-y-4"
        >
          <div>
            <label class="block text-sm font-medium text-white mb-2"
              >Thumbnail</label
            >
            <input
              bind:value={thumbnail}
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-[#f5c518] focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-2"
              >Meta Title</label
            >
            <input
              bind:value={metaTitle}
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-[#f5c518] focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-2"
              >Meta Description</label
            >
            <textarea
              bind:value={metaDescription}
              rows="2"
              maxlength="200"
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white resize-none focus:border-[#f5c518] focus:outline-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-2"
              >Meta Keywords</label
            >
            <input
              bind:value={metaKeywords}
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-[#f5c518] focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-white mb-2"
              >OG Image</label
            >
            <input
              bind:value={ogImage}
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-[#f5c518] focus:outline-none"
            />
          </div>
        </div>

        <button
          disabled={submitting}
          onclick={handleSubmit}
          class="w-full px-4 py-3 bg-[#f5c518] hover:bg-[#dcb015] text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Menyimpan..." : "Update Artikel"}
        </button>
      </div>
    </div>
  {/if}
</div>
