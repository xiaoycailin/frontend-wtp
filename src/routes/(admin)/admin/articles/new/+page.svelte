<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  let loading = false;
  let submitting = false;

  // Form state
  let title = "";
  let slug = "";
  let content = "";
  let excerpt = "";
  let thumbnail = "";
  let metaTitle = "";
  let metaDescription = "";
  let metaKeywords = "";
  let ogImage = "";
  let status = "DRAFT";

  // Fetch categories and tags
  let categories: any[] = [];
  let selectedCategoryId = "";
  let tags: any[] = [];
  let selectedTags: string[] = [];

  async function fetchCategoriesAndTags() {
    loading = true;
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/article-categories"),
        fetch("/api/article-tags"),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        categories = catData.data || [];
      }

      if (tagRes.ok) {
        const tagData = await tagRes.json();
        tags = tagData.data || [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchCategoriesAndTags();
  });

  $: if (title && !slug) {
    // Auto-generate slug from title
    slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  }

  async function handleSubmit() {
    if (!title || !slug || !content) {
      alert("Judul, slug, dan konten wajib diisi");
      return;
    }

    submitting = true;

    try {
      const jwtToken = localStorage.getItem("jwt_token");

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          thumbnail,
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

      if (res.ok) {
        alert("Artikel berhasil dibuat!");
        goto("/admin/articles");
      } else {
        alert(data.data?.message || "Gagal membuat artikel");
      }
    } catch (error) {
      console.error("Error creating article:", error);
      alert("Terjadi kesalahan saat membuat artikel");
    } finally {
      submitting = false;
    }
  }

  function toggleTag(tagId: string) {
    if (selectedTags.includes(tagId)) {
      selectedTags = selectedTags.filter((id) => id !== tagId);
    } else {
      selectedTags.push(tagId);
    }
  }
</script>

<div class="space-y-6 max-w-5xl">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-white">Tambah Artikel Baru</h1>
      <p class="text-sm text-white/50 mt-1">
        Buat konten artikel atau blog yang menarik
      </p>
    </div>
    <button
      onclick={() => goto("/admin/articles")}
      class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
    >
      Cancel
    </button>
  </div>

  {#if loading}
    <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-8 text-center">
      <p class="text-white/40">Loading...</p>
    </div>
  {:else}
    <!-- Main Content & Sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Content Editor -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Title & Slug -->
        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <label class="block text-sm font-medium text-white mb-2"
            >Judul Artikel *</label
          >
          <input
            type="text"
            bind:value={title}
            placeholder="Masukkan judul artikel..."
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors"
          />

          <label class="block text-sm font-medium text-white mb-2 mt-4"
            >Slug (URL)</label
          >
          <input
            type="text"
            bind:value={slug}
            placeholder="judul-artikel"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors"
          />
        </div>

        <!-- Content -->
        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <label class="block text-sm font-medium text-white mb-2"
            >Konten Artikel *</label
          >
          <textarea
            bind:value={content}
            rows="15"
            placeholder="Tulis konten artikel Anda di sini..."
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors resize-none font-mono text-sm"
          ></textarea>
        </div>

        <!-- Excerpt -->
        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <label class="block text-sm font-medium text-white mb-2"
            >Excerpt (Summary)</label
          >
          <textarea
            bind:value={excerpt}
            rows="3"
            placeholder="Ringkasan singkat artikel untuk preview..."
            maxlength="500"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors resize-none"
          ></textarea>
          <p class="text-xs text-white/40 mt-1">
            {excerpt.length}/500 karakter
          </p>
        </div>
      </div>

      <!-- Right Column - Settings -->
      <div class="space-y-6">
        <!-- Publish Settings -->
        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <h3 class="text-sm font-semibold text-white mb-4">Publish</h3>

          <label class="block text-sm font-medium text-white mb-2">Status</label
          >
          <select
            bind:value={status}
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#f5c518] focus:outline-none transition-colors"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <!-- Category -->
        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <h3 class="text-sm font-semibold text-white mb-4">Kategori</h3>

          <select
            bind:value={selectedCategoryId}
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#f5c518] focus:outline-none transition-colors"
          >
            <option value="">Pilih Kategori</option>
            {#each categories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>

        <!-- Tags -->
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
                  >{tag.name}</span
                >
              </label>
            {/each}
          </div>
        </div>

        <!-- Thumbnail -->
        <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
          <h3 class="text-sm font-semibold text-white mb-4">Thumbnail</h3>
          <input
            type="text"
            bind:value={thumbnail}
            placeholder="https://example.com/image.jpg"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors text-sm"
          />
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-3">
          <button
            disabled={submitting}
            onclick={handleSubmit}
            class="flex-1 px-4 py-2.5 bg-[#f5c518] hover:bg-[#dcb015] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Menyimpan..." : "Simpan Artikel"}
          </button>
          <button
            onclick={() => handleSubmit()}
            class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Preview
          </button>
        </div>
      </div>
    </div>

    <!-- SEO Settings -->
    <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-white mb-4">SEO Settings</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-white mb-2"
            >Meta Title</label
          >
          <input
            type="text"
            bind:value={metaTitle}
            placeholder="Custom SEO title"
            maxlength="100"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-white mb-2"
            >Meta Keywords</label
          >
          <input
            type="text"
            bind:value={metaKeywords}
            placeholder="keyword1, keyword2, keyword3"
            maxlength="500"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-white mb-2"
            >Meta Description</label
          >
          <textarea
            bind:value={metaDescription}
            rows="2"
            placeholder="Custom SEO description..."
            maxlength="200"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-white mb-2"
            >OG Image URL</label
          >
          <input
            type="text"
            bind:value={ogImage}
            placeholder="Social media image URL"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#f5c518] focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  {/if}
</div>
