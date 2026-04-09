<script lang="ts">
  type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUND" | "";
  type OrderStatus = "PENDING" | "SUCCESS" | "FAILED" | "WAIT_PAYMENT" | "";

  type Transaction = {
    id: string;
    trxId: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    phoneNumber: string | null;
    email: string | null;
    userAccountData: Record<string, any> | null;
    product: {
      id: string;
      title: string;
      thumbnails: string;
    } | null;
    paymentMethod: {
      paymentName: string;
      methodCode: string;
      source: string;
      thumbnail: string;
    } | null;
    quantity: number;
    fee: number;
    price: string;
    totalPrice: string;
  };

  type Meta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  const { data } = $props();

  let transactions = $state<Transaction[]>(data.transactions ?? []);
  let highlightedIds = $state<string[]>([]);
  let toastMessage = $state<string | null>(null);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  let meta = $state<Meta>(
    data.meta ?? {
      page: 1,
      limit: 20,
      total: transactions.length,
      totalPages: 1,
    },
  );

  let loading = $state(false);
  let error = $state<string | null>(null);
  let lastUpdated = $state<string | null>(null);

  const token: string | null = data.token ?? null;

  // filter state
  let qTrxId = $state("");
  let qPaymentStatus = $state<PaymentStatus>("");
  let qOrderStatus = $state<OrderStatus>("");
  let qUserId = $state("");
  let qSort = $state<"asc" | "desc">("desc");
  let qSearch = $state("");

  // pagination state
  let page = $state(meta.page ?? 1);
  let limit = $state(meta.limit ?? 20);

  function buildQuery() {
    const params = new URLSearchParams();
    if (qTrxId.trim()) params.set("trxId", qTrxId.trim());
    if (qPaymentStatus) params.set("paymentStatus", qPaymentStatus);
    if (qOrderStatus) params.set("orderStatus", qOrderStatus);
    if (qUserId.trim()) params.set("userId", qUserId.trim());
    if (qSort) params.set("createdAtSort", qSort);
    if (qSearch.trim()) params.set("search", qSearch.trim());
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  }

  async function fetchTransactions() {
    loading = true;
    error = null;
    try {
      const qs = buildQuery();
      const res = await fetch(
        `/api/v1/transactions/history${qs ? `?${qs}` : ""}`,
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal memuat transaksi");
      }

      const nextItems = json.data.items ?? [];
      const previousIds = new Set(transactions.map((item) => item.id));
      const incoming = nextItems.filter((item: Transaction) => !previousIds.has(item.id));

      transactions = nextItems;
      meta = json.data.meta ?? {
        page,
        limit,
        total: transactions.length,
        totalPages: 1,
      };
      lastUpdated = new Date().toLocaleTimeString("id-ID");

      if (incoming.length > 0) {
        highlightedIds = incoming.map((item: Transaction) => item.id);
        if (toastTimer) clearTimeout(toastTimer);
        toastMessage = `${incoming.length} transaksi baru masuk`;
        toastTimer = setTimeout(() => {
          highlightedIds = [];
          toastMessage = null;
        }, 5000);
      }
    } catch (e: any) {
      error = e?.message ?? "Terjadi kesalahan saat memuat transaksi";
    } finally {
      loading = false;
    }
  }

  function applyFilters() {
    page = 1; // reset ke halaman 1 tiap ganti filter
    fetchTransactions();
  }

  function resetFilters() {
    qTrxId = "";
    qPaymentStatus = "";
    qOrderStatus = "";
    qUserId = "";
    qSort = "desc";
    qSearch = "";
    page = 1;
    fetchTransactions();
  }

  function goToPage(p: number) {
    const target = Math.min(Math.max(p, 1), meta.totalPages || 1);
    if (target === page) return;
    page = target;
    fetchTransactions();
  }

  function changeLimit(newLimit: number) {
    limit = newLimit;
    page = 1;
    fetchTransactions();
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function formatCurrency(v: string | number) {
    const n = typeof v === "string" ? Number(v) : v;
    if (Number.isNaN(n)) return "-";
    return n.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  }

  $effect(() => {
    fetchTransactions();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchTransactions();
      }
    }, 10000);

    return () => clearInterval(interval);
  });

  function statusColor(status: string) {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
      case "FAILED":
        return "bg-red-500/10 text-red-300 border-red-500/40";
      case "REFUND":
        return "bg-sky-500/10 text-sky-300 border-sky-500/40";
      case "WAIT_PAYMENT":
      case "PENDING":
      default:
        return "bg-amber-500/10 text-amber-300 border-amber-500/40";
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
        Transaksi
      </p>
      <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
        Riwayat Transaksi
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Filter transaksi berdasarkan status, user, kata kunci, dan halaman.
      </p>
    </div>
    {#if lastUpdated}
      <p class="text-[11px] text-white/40">auto refresh 10 detik Â· update terakhir {lastUpdated}</p>
    {/if}
  </header>

  <!-- Filter bar -->
  <div
    class="bg-[#0c0c0c] border border-white/10 rounded-2xl p-3 md:p-4 space-y-3 text-[11px]"
  >
    <div class="grid gap-2 md:grid-cols-5">
      <label class="flex flex-col gap-1">
        <span class="text-white/60">Trx ID</span>
        <input
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
          bind:value={qTrxId}
          placeholder="M-XXXX"
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-white/60">Payment Status</span>
        <select
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
          bind:value={qPaymentStatus}
        >
          <option value="">Semua</option>
          <option value="PENDING">PENDING</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUND">REFUND</option>
        </select>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-white/60">Order Status</span>
        <select
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
          bind:value={qOrderStatus}
        >
          <option value="">Semua</option>
          <option value="WAIT_PAYMENT">WAIT_PAYMENT</option>
          <option value="PENDING">PENDING</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
        </select>
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-white/60">User ID</span>
        <input
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
          bind:value={qUserId}
          placeholder="userId"
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-white/60">Urutkan Tanggal</span>
        <select
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
          bind:value={qSort}
        >
          <option value="desc">Terbaru dulu</option>
          <option value="asc">Terlama dulu</option>
        </select>
      </label>
    </div>

    <div class="grid gap-2 md:grid-cols-[2fr_1fr]">
      <label class="flex flex-col gap-1">
        <span class="text-white/60">
          Search (ID game / server / phone / email)
        </span>
        <input
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
          bind:value={qSearch}
          placeholder="0878..., server_id, email, dll"
        />
      </label>
      <div class="flex items-end gap-2">
        <button
          type="button"
          class="w-full px-3 py-2 rounded-lg font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 text-[11px]"
          onclick={resetFilters}
        >
          Reset
        </button>
        <button
          type="button"
          class="w-full px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740] text-[11px]"
          onclick={applyFilters}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Filter"}
        </button>
      </div>
    </div>
  </div>

  {#if error}
    <p class="text-xs text-red-400">{error}</p>
  {/if}

  <!-- info & pagination top -->
  <div
    class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[11px] text-white/60"
  >
    <p>
      Total transaksi: {meta.total} Â· Halaman {meta.page} dari
      {" "}
      {meta.totalPages}
    </p>
    <div class="flex items-center gap-2">
      <span>Per halaman</span>
      <select
        class="px-2 py-1 rounded-lg border border-white/10 bg-black/40 text-white outline-none focus:border-[var(--color-primary)]"
        bind:value={limit}
        onchange={(e) =>
          changeLimit(Number((e.target as HTMLSelectElement).value))}
      >
        <option value="10" class="text-black">10</option>
        <option value="20" class="text-black">20</option>
        <option value="50" class="text-black">50</option>
      </select>
    </div>
  </div>

  <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-[11px]">
        <thead class="bg-white/5">
          <tr>
            <th class="px-3 py-2 font-semibold text-white/60">Transaksi</th>
            <th class="px-3 py-2 font-semibold text-white/60">Produk</th>
            <th class="px-3 py-2 font-semibold text-white/60">User</th>
            <th class="px-3 py-2 font-semibold text-white/60">Payment</th>
            <th class="px-3 py-2 font-semibold text-white/60">Total</th>
            <th class="px-3 py-2 font-semibold text-white/60">Status</th>
            <th class="px-3 py-2 font-semibold text-white/60">Tgl</th>
            <th class="px-3 py-2 font-semibold text-white/60 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {#if !transactions.length}
            <tr>
              <td
                colspan="8"
                class="px-3 py-6 text-center text-white/40 text-xs"
              >
                Belum ada transaksi.
              </td>
            </tr>
          {:else}
            {#each transactions as trx}
              <tr class={`border-t border-white/5 hover:bg-white/[0.03] ${highlightedIds.includes(trx.id) ? "bg-emerald-500/10" : ""}`}>
                <!-- Transaksi -->
                <td class="px-3 py-2 align-top">
                  <div class="space-y-0.5">
                    <p class="text-xs font-semibold text-white">
                      {trx.trxId}
                    </p>
                    <p class="text-[10px] text-white/40 break-all">
                      ID: {trx.id}
                    </p>
                  </div>
                </td>

                <!-- Produk -->
                <td class="px-3 py-2 align-top">
                  {#if trx.product}
                    <div class="flex items-center gap-2">
                      {#if trx.product.thumbnails}
                        <img
                          src={trx.product.thumbnails}
                          alt={trx.product.title}
                          class="w-8 h-8 rounded-md object-cover"
                          loading="lazy"
                        />
                      {/if}
                      <div class="min-w-0">
                        <p class="text-xs font-semibold text-white truncate">
                          {trx.product.title}
                        </p>
                        <p class="text-[10px] text-white/40">
                          Qty: {trx.quantity}
                        </p>
                      </div>
                    </div>
                  {:else}
                    <span class="text-[10px] text-white/40">-</span>
                  {/if}
                </td>

                <!-- User -->
                <td class="px-3 py-2 align-top">
                  <div class="space-y-0.5">
                    {#if trx.userAccountData}
                      <p class="text-[10px] text-white/60">
                        ID: {trx.userAccountData.primary_id}
                      </p>
                      {#if trx.userAccountData.server_id}
                        <p class="text-[10px] text-white/40">
                          Server: {trx.userAccountData.server_id}
                        </p>
                      {/if}
                    {/if}
                    {#if trx.phoneNumber}
                      <p class="text-[10px] text-white/60">
                        HP: {trx.phoneNumber}
                      </p>
                    {/if}
                    {#if trx.email}
                      <p class="text-[10px] text-white/60">
                        Email: {trx.email}
                      </p>
                    {/if}
                    {#if !trx.userAccountData && !trx.phoneNumber && !trx.email}
                      <span class="text-[10px] text-white/40">-</span>
                    {/if}
                  </div>
                </td>

                <!-- Payment -->
                <td class="px-3 py-2 align-top">
                  {#if trx.paymentMethod}
                    <div class="flex items-center gap-2">
                      {#if trx.paymentMethod.thumbnail}
                        <img
                          src={trx.paymentMethod.thumbnail}
                          alt={trx.paymentMethod.paymentName}
                          class="w-7 h-7 rounded-md object-contain bg-white"
                          loading="lazy"
                        />
                      {/if}
                      <div class="min-w-0">
                        <p class="text-xs font-semibold text-white truncate">
                          {trx.paymentMethod.paymentName}
                        </p>
                        <p class="text-[10px] text-white/40">
                          {trx.paymentMethod.methodCode} Â· {trx.paymentMethod
                            .source}
                        </p>
                      </div>
                    </div>
                  {:else}
                    <span class="text-[10px] text-white/40">-</span>
                  {/if}
                </td>

                <!-- Total -->
                <td class="px-3 py-2 align-top text-white/80">
                  <div class="space-y-0.5">
                    <p class="text-xs font-semibold">
                      {formatCurrency(trx.totalPrice)}
                    </p>
                    <p class="text-[10px] text-white/40">
                      Harga: {formatCurrency(trx.price)} Â· Fee:
                      {" "}
                      {formatCurrency(trx.fee)}
                    </p>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-3 py-2 align-top">
                  <div class="space-y-1">
                    <span
                      class={`inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border ${statusColor(
                        trx.paymentStatus,
                      )}`}
                    >
                      Payment: {trx.paymentStatus}
                    </span>
                    <span
                      class={`inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border ${statusColor(
                        trx.orderStatus,
                      )}`}
                    >
                      Order: {trx.orderStatus}
                    </span>
                  </div>
                </td>

                <!-- CreatedAt -->
                <td class="px-3 py-2 align-top text-white/70">
                  <p class="text-[10px]">{formatDate(trx.createdAt)}</p>
                </td>

                <!-- Aksi -->
                <td class="px-3 py-2 align-top text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <a
                      href={`/admin/transactions/${trx.trxId}`}
                      class="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                    >
                      Detail
                    </a>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- pagination bottom -->
  <div
    class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[11px] text-white/60"
  >
    <p>
      Menampilkan
      {" "}
      {meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}
      {"â€“"}
      {Math.min(meta.page * meta.limit, meta.total)}
      {" "}
      dari {meta.total} transaksi
    </p>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="px-2 py-1 rounded-lg border border-white/10 bg-black/40 text-white/70 disabled:opacity-40"
        onclick={() => goToPage(page - 1)}
        disabled={page <= 1 || loading}
      >
        â€¹ Prev
      </button>
      <span>
        Hal {page} / {meta.totalPages || 1}
      </span>
      <button
        type="button"
        class="px-2 py-1 rounded-lg border border-white/10 bg-black/40 text-white/70 disabled:opacity-40"
        onclick={() => goToPage(page + 1)}
        disabled={page >= (meta.totalPages || 1) || loading}
      >
        Next â€º
      </button>
    </div>
  </div>
  {#if toastMessage}
    <div class="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold shadow-lg backdrop-blur-sm">
      {toastMessage}
    </div>
  {/if}
</section>

