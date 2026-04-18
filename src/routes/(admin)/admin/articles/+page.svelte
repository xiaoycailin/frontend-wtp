<script lang="ts">
  import { onMount } from "svelte";
  import { derived, writable } from "svelte/store";
  import { goto } from "$app/navigation";

  let articles:any[] = $derived([]);
  let loading = true;
  let total = 0;
  let currentPage = 1;
  const limit = 10;

  async function fetchArticles() {
    loading = true;
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      
      if (data.data) {
        articles = data.data.items || [];
        total = data.data.meta?.total || 0;
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchArticles();
  });

  async function deleteArticle(id: string) {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        await fetchArticles();
      } else {
        alert("Gagal menghapus artikel");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Terjadi kesalahan");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "PUBLISHED":
        return { label: "Published", color: "bg-green-500/20 text-green-400 border-green-500/30" };
      case "DRAFT":
        return { label: "Draft", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
      case "ARCHIVED":
        return { label: "Archived", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
      default:
        return { label: status, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-white">Artikel</h1>
      <p class="text-sm text-white/50 mt-1">Kelola konten artikel dan blog website</p>
    </div>
    <button 
      onclick={() => goto("/admin/articles/new")}
      class="px-4 py-2 bg-[#f5c518] hover:bg-[#dcb015] text-black font-semibold rounded-lg transition-colors"
    >
      + Tambah Artikel
    </button>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-white/40">Total Artikel</p>
          <p class="text-2xl font-bold text-white mt-1">{loading ? "-" : total}</p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-[#f5c518]/15 flex items-center justify-center">
          <svg class="w-6 h-6 text-[#f5c518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-white/40">Published</p>
          <p class="text-2xl font-bold text-green-400 mt-1">
            {loading ? "-" : articles.filter(a => a.status === "PUBLISHED").length}
          </p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-green-500/15 flex items-center justify-center">
          <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-white/40">Draft</p>
          <p class="text-2xl font-bold text-yellow-400 mt-1">
            {loading ? "-" : articles.filter(a => a.status === "DRAFT").length}
          </p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-yellow-500/15 flex items-center justify-center">
          <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-[#0b0b0b] border border-white/5 rounded-xl p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-white/40">Views</p>
          <p class="text-2xl font-bold text-blue-400 mt-1">
            {loading ? "-" : articles.reduce((sum, a) => sum + (a.views || 0), 0)}
          </p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Articles Table -->
  <div class="bg-[#0b0b0b] border border-white/5 rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-white/5">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Judul</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Kategori</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Views</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Likes</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Tanggal</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          {#if loading}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-white/40">Loading...</td>
            </tr>
          {:else if articles.length === 0}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-white/40">Belum ada artikel</td>
            </tr>
          {:else}
            {#each articles as article}
              {@const statusBadge = getStatusBadge(article.status)}
              <tr class="hover:bg-white/5 transition-colors">
                <td class="px-4 py-4">
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-white truncate max-w-xs">{article.title}</p>
                    <p class="text-xs text-white/40 truncate">{article.slug}</p>
                  </div>
                </td>
                <td class="px-4 py-4">
                  {#if article.category}
                    <span class="text-sm text-white/80">{article.category.name}</span>
                  {:else}
                    <span class="text-xs text-white/40">-</span>
                  {/if}
                </td>
                <td class="px-4 py-4">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm text-white/80">{article.views ?? 0}</td>
                <td class="px-4 py-4 text-sm text-white/80">{article.likesCount ?? 0}</td>
                <td class="px-4 py-4 text-sm text-white/60">
                  {new Date(article.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td class="px-4 py-4 text-right space-x-2">
                  <button 
                    onclick={() => goto(`/admin/articles/${article.id}`)}
                    class="text-xs text-[#f5c518] hover:text-[#dcb015] transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onclick={() => deleteArticle(article.id)}
                    class="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    {#if !loading && total > 0}
      <div class="px-4 py-3 border-t border-white/5 flex items-center justify-between">
        <p class="text-xs text-white/40">
          Halaman {currentPage} dari {Math.ceil(total / limit)}
        </p>
        <div class="flex gap-2">
          <button
            disabled={currentPage <= 1}
            onclick={() => { currentPage -= 1; fetchArticles(); }}
            class="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= Math.ceil(total / limit)}
            onclick={() => { currentPage += 1; fetchArticles(); }}
            class="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
