<script lang="ts">
  type SystemLog = {
    id: string;
    type: string;
    source: string;
    message: string;
    statusCode?: number | null;
    method?: string | null;
    url?: string | null;
    trxId?: string | null;
    provider?: string | null;
    requestPayload?: any;
    responsePayload?: any;
    errorStack?: string | null;
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

  let logs = $state<SystemLog[]>([]);
  let meta = $state<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  let loading = $state(false);
  let error = $state<string | null>(null);
  let search = $state("");
  let type = $state("");
  let provider = $state("");
  let trxId = $state("");
  let page = $state(1);
  let limit = $state(20);

  function buildQuery() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (type) params.set("type", type);
    if (provider) params.set("provider", provider);
    if (trxId.trim()) params.set("trxId", trxId.trim());
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  }

  async function fetchLogs() {
    loading = true;
    error = null;
    try {
      const res = await fetch(`/api/v1/system-logs?${buildQuery()}`, {
        headers: {
          Authorization: "Bearer " + data.token,
        },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal memuat system log",
        );
      }
      logs = json?.data?.items ?? [];
      meta = json?.data?.meta ?? meta;
    } catch (e: any) {
      error = e?.message ?? "Gagal memuat system log";
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
    type = "";
    provider = "";
    trxId = "";
    page = 1;
    fetchLogs();
  }

  function goToPage(next: number) {
    if (next < 1 || next > meta.totalPages) return;
    page = next;
    fetchLogs();
  }

  function formatDate(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function statusTone(code?: number | null) {
    if (!code) return "text-white/50";
    if (code >= 500) return "text-red-300";
    if (code >= 400) return "text-amber-300";
    return "text-emerald-300";
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
        System Log
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Log Sistem Backend
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Pantau error backend, callback provider, dan kegagalan request
        third-party.
      </p>
    </div>
  </header>

  <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-4">
    <div class="grid gap-3 md:grid-cols-5 text-xs">
      <input
        bind:value={search}
        placeholder="Cari message / source / url"
        class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
      />
      <select
        bind:value={type}
        class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
      >
        <option value="">Semua Type</option>
        <option value="app_error">app_error</option>
        <option value="app_warning">app_warning</option>
        <option value="third_party_error">third_party_error</option>
        <option value="digiflazz_callback">digiflazz_callback</option>
        <option value="duitku_callback">duitku_callback</option>
        <option value="midtrans_callback">midtrans_callback</option>
      </select>
      <select
        bind:value={provider}
        class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
      >
        <option value="">Semua Provider</option>
        <option value="digiflazz">digiflazz</option>
        <option value="duitku">duitku</option>
        <option value="midtrans">midtrans</option>
      </select>
      <input
        bind:value={trxId}
        placeholder="Filter trxId"
        class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
      />
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
      Total <span class="text-white font-semibold">{meta.total}</span> log sistem
    </div>

    {#if loading}
      <div class="p-4 text-sm text-white/50">Memuat system log...</div>
    {:else if logs.length === 0}
      <div class="p-4 text-sm text-white/50">Belum ada system log.</div>
    {:else}
      <div class="divide-y divide-white/5">
        {#each logs as log}
          <div class="p-4 space-y-2">
            <div
              class="flex flex-col md:flex-row md:items-start md:justify-between gap-2"
            >
              <div>
                <p class="text-sm font-semibold text-white">{log.message}</p>
                <p class="text-[11px] text-white/45">
                  {log.type} · {log.source} · {log.provider ?? "-"}
                </p>
              </div>
              <p class="text-[11px] text-white/45 shrink-0">
                {formatDate(log.createdAt)}
              </p>
            </div>
            <div
              class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/60"
            >
              <span class={statusTone(log.statusCode)}
                >Status: {log.statusCode ?? "-"}</span
              >
              <span>Method: {log.method ?? "-"}</span>
              <span>Trx ID: {log.trxId ?? "-"}</span>
              <span>URL: {log.url ?? "-"}</span>
            </div>
            {#if log.requestPayload}
              <details class="text-[11px] text-white/55">
                <summary class="cursor-pointer select-none"
                  >Lihat request payload</summary
                >
                <pre
                  class="mt-2 p-3 rounded-xl bg-black/30 border border-white/5 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(
                    log.requestPayload,
                    null,
                    2,
                  )}</pre>
              </details>
            {/if}
            {#if log.responsePayload}
              <details class="text-[11px] text-white/55">
                <summary class="cursor-pointer select-none"
                  >Lihat response payload</summary
                >
                <pre
                  class="mt-2 p-3 rounded-xl bg-black/30 border border-white/5 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(
                    log.responsePayload,
                    null,
                    2,
                  )}</pre>
              </details>
            {/if}
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
            {#if log.errorStack}
              <details class="text-[11px] text-red-200/80">
                <summary class="cursor-pointer select-none"
                  >Lihat error stack</summary
                >
                <pre
                  class="mt-2 p-3 rounded-xl bg-red-950/30 border border-red-500/20 overflow-x-auto whitespace-pre-wrap">{log.errorStack}</pre>
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
