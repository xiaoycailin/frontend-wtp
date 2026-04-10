<script lang="ts">
  type ActivityLog = {
    id: string;
    actorName?: string | null;
    actorRole?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    entityLabel?: string | null;
    description?: string | null;
    metadata?: any;
    createdAt: string;
  };

  type Meta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  export const { data } = $props();

  let logs = $state<ActivityLog[]>([]);
  let meta = $state<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  let loading = $state(false);
  let error = $state<string | null>(null);
  let search = $state("");
  let action = $state("");
  let entityType = $state("");
  let page = $state(1);
  let limit = $state(20);

  function buildQuery() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (action) params.set("action", action);
    if (entityType) params.set("entityType", entityType);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  }

  async function fetchLogs() {
    loading = true;
    error = null;
    try {
      const res = await fetch(`/api/v1/activity-logs?${buildQuery()}`, {
        headers: {
          Authorization: "Bearer " + data.token,
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal memuat activity log",
        );
      }
      logs = json?.data?.items ?? [];
      meta = json?.data?.meta ?? meta;
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat activity log";
    } finally {
      loading = false;
    }
  }

  function applyFilter() {
    page = 1;
    fetchLogs();
  }

  function resetFilter() {
    search = "";
    action = "";
    entityType = "";
    page = 1;
    fetchLogs();
  }

  function goToPage(next: number) {
    if (next < 1 || next > meta.totalPages) return;
    page = next;
    fetchLogs();
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  $effect(() => {
    fetchLogs();
  });
</script>

<section class="space-y-6">
  <header
    class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
  >
    <div>
      <p
        class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1"
      >
        Activity Log
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Riwayat Aktivitas Admin
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Pantau aksi penting admin seperti update transaksi, retry order, dan
        perubahan flash sale.
      </p>
    </div>
  </header>

  <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-4">
    <div class="grid gap-3 md:grid-cols-4 text-xs">
      <input
        bind:value={search}
        placeholder="Cari actor / deskripsi / entity"
        class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
      />
      <select
        bind:value={action}
        class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
      >
        <option value="">Semua Action</option>
        <option value="flashsale.create">flashsale.create</option>
        <option value="flashsale.update">flashsale.update</option>
        <option value="flashsale.delete">flashsale.delete</option>
        <option value="transaction.admin_update"
          >transaction.admin_update</option
        >
        <option value="transaction.retry_order">transaction.retry_order</option>
      </select>
      <select
        bind:value={entityType}
        class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
      >
        <option value="">Semua Entity</option>
        <option value="flash_sale">flash_sale</option>
        <option value="transaction">transaction</option>
      </select>
      <div class="flex gap-2">
        <button
          type="button"
          onclick={applyFilter}
          class="flex-1 px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
          >Filter</button
        >
        <button
          type="button"
          onclick={resetFilter}
          class="px-3 py-2 rounded-lg font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10"
          >Reset</button
        >
      </div>
    </div>

    {#if error}
      <p class="text-xs text-red-400">{error}</p>
    {/if}
  </div>

  <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 text-xs text-white/50">
      Total <span class="text-white font-semibold">{meta.total}</span> aktivitas
    </div>

    {#if loading}
      <div class="p-4 text-sm text-white/50">Memuat activity log...</div>
    {:else if logs.length === 0}
      <div class="p-4 text-sm text-white/50">Belum ada activity log.</div>
    {:else}
      <div class="divide-y divide-white/5">
        {#each logs as log}
          <div class="p-4 space-y-2">
            <div
              class="flex flex-col md:flex-row md:items-start md:justify-between gap-2"
            >
              <div>
                <p class="text-sm font-semibold text-white">
                  {log.description ?? log.action}
                </p>
                <p class="text-[11px] text-white/45">
                  {log.action} · {log.entityType} · {log.entityLabel ??
                    log.entityId ??
                    "-"}
                </p>
              </div>
              <p class="text-[11px] text-white/45 shrink-0">
                {formatDate(log.createdAt)}
              </p>
            </div>
            <div
              class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/60"
            >
              <span>Actor: {log.actorName ?? "-"}</span>
              <span>Role: {log.actorRole ?? "-"}</span>
            </div>
            {#if log.metadata}
              <details class="text-[11px] text-white/55">
                <summary class="cursor-pointer select-none"
                  >Lihat metadata</summary
                >
                <pre
                  class="mt-2 p-3 rounded-xl bg-black/30 border border-white/5 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(
                    log.metadata,
                    null,
                    2,
                  )}</pre>
              </details>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <div
      class="px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs text-white/60"
    >
      <span>Halaman {meta.page} dari {meta.totalPages}</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={() => goToPage(page - 1)}
          disabled={page <= 1}
          class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40"
          >Prev</button
        >
        <button
          type="button"
          onclick={() => goToPage(page + 1)}
          disabled={page >= meta.totalPages}
          class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40"
          >Next</button
        >
      </div>
    </div>
  </div>
</section>
