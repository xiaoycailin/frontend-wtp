<script lang="ts">
  import { setupFetchInterceptor } from "$lib/setup/interceptor.js";
  import { onMount } from "svelte";

  type StatusCount = {
    paymentStatus?: string;
    orderStatus?: string;
    count: number;
  };
  type MethodSummary = {
    paymentMethodId: number;
    paymentName: string;
    methodCode: string | null;
    group: string | null;
    thumbnail: string | null;
    countAll: number;
    sumAll: number;
    countPaymentSuccess: number;
    sumPaymentSuccess: number;
    countFullySuccess: number;
    sumFullySuccess: number;
  };

  type SubCategorySummary = {
    subCategoryId: string;
    subCategoryTitle: string;
    categoryId: string | null;
    categoryTitle: string | null;
    totalTransactionsAll: number;
    totalQtyAll: number;
    sumAll: number;
    totalTransactionsPaymentSuccess: number;
    sumPaymentSuccess: number;
    totalTransactionsFullySuccess: number;
    sumFullySuccess: number;
  };

  type PeriodStat = {
    totalTransactions: number;
    totalRevenue: number;
  };

  type RecentTransaction = {
    id: string;
    trxId: string;
    totalPrice: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    product?: { title?: string | null } | null;
    paymentMethod?: { paymentName?: string | null } | null;
  };

  type QuickAction = {
    label: string;
    href: string;
  };

  type TopProduct = {
    productId: string;
    title: string;
    thumbnail: string | null;
    count: number;
    sum: number;
  };

  type AlertItem = {
    type: string;
    level: "info" | "warning" | "danger";
    message: string;
  };

  type Funnel = {
    totalCreated: number;
    paymentSuccess: number;
    orderSuccess: number;
    paymentFailed: number;
    orderFailed: number;
    waitPayment: number;
  };

  type TrendItem = {
    date: string;
    totalTransactions: number;
    totalRevenue: number;
  };

  type Summary = {
    totalCount: number;
    totalPaymentSuccessCount: number;
    totalPaymentFailedCount: number;
    totalPaymentPendingCount: number;
    totalOrderSuccessCount: number;
    totalOrderFailedCount: number;
    totalOrderPendingCount: number;
    totalOrderWaitPaymentCount: number;
    sumPrice: number;
    sumTotalPrice: number;
    sumDiscount: number;
    sumFee: number;
    grossFromPaymentSuccess: number;
    netFromPaymentSuccess: number;
    grossFullySuccess: number;
    netFullySuccess: number;
    grossOrderFailed: number;
    netOrderFailed: number;
    perPaymentStatus: StatusCount[];
    perOrderStatus: StatusCount[];
    perPaymentMethod: MethodSummary[];
    perSubCategory: SubCategorySummary[];
    periodStats?: {
      today: PeriodStat;
      last7Days: PeriodStat;
    };
    recentTransactions?: RecentTransaction[];
    quickActions?: QuickAction[];
    topProducts?: TopProduct[];
    topSubCategories?: SubCategorySummary[];
    alerts?: AlertItem[];
    funnel?: Funnel;
    trends?: TrendItem[];
  };

  const { data } = $props();
  const token: string | null = data.token ?? null;
  // console.log(data);

  let summary = $state<Summary | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let lastUpdated = $state<string | null>(null);
  let toastMessage = $state<string | null>(null);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  let from = $state("");
  let to = $state("");
  let paymentStatusFilter = $state("ALL");
  let orderStatusFilter = $state("ALL");

  const paymentStatusOptions = ["ALL", "SUCCESS", "PENDING", "FAILED"];
  const orderStatusOptions = [
    "ALL",
    "SUCCESS",
    "PENDING",
    "FAILED",
    "WAIT_PAYMENT",
  ];

  function formatCurrency(v: number) {
    if (!v) return "Rp 0";
    return v.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  async function fetchSummary() {
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());
      if (paymentStatusFilter !== "ALL")
        params.set("paymentStatus", paymentStatusFilter);
      if (orderStatusFilter !== "ALL")
        params.set("orderStatus", orderStatusFilter);

      const res = await fetch(
        `/api/v1/transactions/summary${params.size ? `?${params}` : ""}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? "Gagal memuat summary");
      }
      const previousTotal = summary?.totalCount ?? 0;
      summary = json.data;
      lastUpdated = new Date().toLocaleTimeString("id-ID");

      if ((summary?.totalCount ?? 0) > previousTotal && previousTotal !== 0) {
        const diff = (summary?.totalCount ?? 0) - previousTotal;
        if (toastTimer) clearTimeout(toastTimer);
        toastMessage = `${diff} transaksi baru terdeteksi`;
        toastTimer = setTimeout(() => {
          toastMessage = null;
        }, 5000);
      }
    } catch (e: any) {
      error = e?.message ?? "Terjadi kesalahan saat memuat summary";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    setupFetchInterceptor();
    fetchSummary();
  });

  $effect(() => {
    // fetchSummary();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchSummary();
      }
    }, 10000);

    return () => clearInterval(interval);
  });

  function resetFilter() {
    from = "";
    to = "";
    paymentStatusFilter = "ALL";
    orderStatusFilter = "ALL";
    fetchSummary();
  }

  function badgeColor(status: string) {
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

  function alertColor(level: AlertItem["level"]) {
    if (level === "danger")
      return "border-red-500/30 bg-red-500/10 text-red-200";
    if (level === "warning")
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  }

  function formatShortDate(value: string) {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  }

  function maxTrendTransactions() {
    return Math.max(
      ...(summary?.trends?.map((item) => item.totalTransactions) ?? [1]),
      1,
    );
  }

  function maxTrendRevenue() {
    return Math.max(
      ...(summary?.trends?.map((item) => item.totalRevenue) ?? [1]),
      1,
    );
  }

  function setPaymentStatusFilter(status: string) {
    paymentStatusFilter = status;
    fetchSummary();
  }

  function setOrderStatusFilter(status: string) {
    orderStatusFilter = status;
    fetchSummary();
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
        Ringkasan Transaksi
      </h1>
      <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
        Statistik singkat performa transaksi dan omzet dalam rentang waktu
        tertentu.
      </p>
    </div>
    <div class="flex flex-col items-start md:items-end gap-2 text-xs">
      {#if lastUpdated}
        <p class="text-[11px] text-white/40">
          auto refresh 10 detik Â· update terakhir {lastUpdated}
        </p>
      {/if}
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-3 py-2 rounded-lg font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
          onclick={resetFilter}
        >
          Reset Tanggal
        </button>
        <button
          type="button"
          class="px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
          onclick={fetchSummary}
        >
          Terapkan
        </button>
      </div>
    </div>
  </header>

  <!-- Filter tanggal -->
  <div
    class="bg-[#0c0c0c] border border-white/10 rounded-2xl p-3 md:p-4 space-y-3 text-[11px]"
  >
    <div class="grid gap-3 md:grid-cols-2">
      <div class="space-y-2">
        <p class="text-white/50 text-[10px] uppercase tracking-[0.14em]">
          Payment Status
        </p>
        <div class="flex flex-wrap gap-2">
          {#each paymentStatusOptions as status}
            <button
              type="button"
              class={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition ${paymentStatusFilter === status ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)]" : "bg-white/5 text-white/75 border-white/10 hover:bg-white/10"}`}
              onclick={() => setPaymentStatusFilter(status)}
            >
              {status}
            </button>
          {/each}
        </div>
      </div>

      <div class="space-y-2">
        <p class="text-white/50 text-[10px] uppercase tracking-[0.14em]">
          Order Status
        </p>
        <div class="flex flex-wrap gap-2">
          {#each orderStatusOptions as status}
            <button
              type="button"
              class={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition ${orderStatusFilter === status ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)]" : "bg-white/5 text-white/75 border-white/10 hover:bg-white/10"}`}
              onclick={() => setOrderStatusFilter(status)}
            >
              {status}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3 items-end">
      <label class="flex flex-col gap-1">
        <span class="text-white/60">Dari tanggal</span>
        <input
          type="date"
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
          bind:value={from}
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-white/60">Sampai tanggal</span>
        <input
          type="date"
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[var(--color-primary)]"
          bind:value={to}
        />
      </label>

      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 px-3 py-2 rounded-lg font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
          onclick={resetFilter}
        >
          Reset
        </button>
        <button
          type="button"
          class="flex-1 px-3 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-black hover:bg-[#ffd740]"
          onclick={fetchSummary}
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

  {#if !summary && loading}
    <p class="text-xs text-white/50">Memuat summary...</p>
  {/if}

  {#if summary}
    <div class="grid gap-4 md:grid-cols-4 text-xs">
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-1">
        <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
          Hari ini
        </p>
        <p class="text-xl font-bold text-white">
          {summary.periodStats?.today.totalTransactions.toLocaleString(
            "id-ID",
          ) ?? "0"}
        </p>
        <p class="text-[10px] text-white/50">transaksi masuk hari ini</p>
        <p class="text-[10px] text-emerald-300">
          {formatCurrency(summary.periodStats?.today.totalRevenue ?? 0)}
        </p>
      </div>

      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-1">
        <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
          7 hari terakhir
        </p>
        <p class="text-xl font-bold text-white">
          {summary.periodStats?.last7Days.totalTransactions.toLocaleString(
            "id-ID",
          ) ?? "0"}
        </p>
        <p class="text-[10px] text-white/50">akumulasi transaksi 7 hari</p>
        <p class="text-[10px] text-emerald-300">
          {formatCurrency(summary.periodStats?.last7Days.totalRevenue ?? 0)}
        </p>
      </div>

      <div
        class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-2 md:col-span-2"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
            Quick action
          </p>
          <p class="text-[10px] text-white/40">shortcut admin</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          {#each summary.quickActions ?? [] as action}
            <a
              href={action.href}
              class="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-[11px] font-medium"
            >
              {action.label}
            </a>
          {/each}
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-4 text-xs">
      <!-- Total transaksi -->
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-1">
        <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
          Total Transaksi (semua)
        </p>
        <p class="text-xl font-bold text-white">
          {summary.totalCount.toLocaleString("id-ID")}
        </p>
        <p class="text-[10px] text-white/50">
          Payment SUCCESS:
          {" "}
          {summary.totalPaymentSuccessCount.toLocaleString("id-ID")}
          {" Â· "}
          PENDING:
          {" "}
          {summary.totalPaymentPendingCount.toLocaleString("id-ID")}
          {" Â· "}
          FAILED:
          {" "}
          {summary.totalPaymentFailedCount.toLocaleString("id-ID")}
        </p>
      </div>

      <!-- Omzet dari payment SUCCESS -->
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-1">
        <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
          Omzet Payment Sukses
        </p>
        <p class="text-xl font-bold text-white">
          {formatCurrency(summary.grossFromPaymentSuccess)}
        </p>
        <p class="text-[10px] text-white/50">
          Uang yang sudah diterima gateway (paymentStatus SUCCESS), termasuk
          order yang masih PENDING.
        </p>
        <p class="text-[10px] text-emerald-300">
          Setelah dikurangi fee:
          {" "}
          {formatCurrency(summary.netFromPaymentSuccess)}
        </p>
      </div>

      <!-- Omzet tuntas (payment & order SUCCESS) -->
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-1">
        <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
          Omzet Tuntas (Payment & Order Sukses)
        </p>
        <p class="text-xl font-bold text-white">
          {formatCurrency(summary.grossFullySuccess)}
        </p>
        <p class="text-[10px] text-white/50">
          Transaksi yang sudah selesai di user (payment & order SUCCESS).
        </p>
        <p class="text-[10px] text-emerald-300">
          Setelah dikurangi fee:
          {" "}
          {formatCurrency(summary.netFullySuccess)}
        </p>
      </div>

      <!-- Order FAILED / Bermasalah -->
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-1">
        <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
          Nilai Transaksi Order Gagal
        </p>
        <p class="text-xl font-bold text-white">
          {formatCurrency(summary.grossOrderFailed)}
        </p>
        <p class="text-[10px] text-white/50">
          Total nilai transaksi dengan orderStatus FAILED. Cocok dipantau untuk
          refund/complain.
        </p>
        <p class="text-[10px] text-red-300">
          Setelah dikurangi fee:
          {" "}
          {formatCurrency(summary.netOrderFailed)}
        </p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 md:p-4">
        <div class="flex items-center justify-between mb-3 text-xs">
          <h2
            class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
          >
            Recent Transactions
          </h2>
          <a
            href="/admin/transactions"
            class="text-[10px] text-[var(--color-primary)]">lihat semua</a
          >
        </div>
        <div class="space-y-2">
          {#if !summary.recentTransactions?.length}
            <p class="text-[11px] text-white/40">
              Belum ada transaksi terbaru.
            </p>
          {:else}
            {#each summary.recentTransactions ?? [] as trx}
              <div
                class="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 flex items-start justify-between gap-3"
              >
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-white truncate">
                    {trx.product?.title ?? trx.trxId}
                  </p>
                  <p class="text-[10px] text-white/40 truncate">
                    {trx.trxId} Â· {trx.paymentMethod?.paymentName ?? "-"}
                  </p>
                  <p class="text-[10px] text-white/40">
                    {formatDateTime(trx.createdAt)}
                  </p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-[11px] font-semibold text-white">
                    {formatCurrency(trx.totalPrice)}
                  </p>
                  <div class="mt-1 flex flex-col items-end gap-1">
                    <span
                      class={`inline-flex rounded-full px-2 py-0.5 border text-[10px] ${badgeColor(trx.paymentStatus)}`}
                      >{trx.paymentStatus}</span
                    >
                    <span
                      class={`inline-flex rounded-full px-2 py-0.5 border text-[10px] ${badgeColor(trx.orderStatus)}`}
                      >{trx.orderStatus}</span
                    >
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <div
          class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-3"
        >
          <h2
            class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
          >
            Payment Status
          </h2>
          <div class="space-y-2 text-[11px]">
            {#if !summary.perPaymentStatus.length}
              <p class="text-white/40">Tidak ada data.</p>
            {:else}
              {#each summary.perPaymentStatus as row}
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span
                      class={`inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border ${badgeColor(
                        row.paymentStatus || "",
                      )}`}
                    >
                      {row.paymentStatus}
                    </span>
                  </div>
                  <p class="text-white/70">
                    {row.count.toLocaleString("id-ID")}
                  </p>
                </div>
              {/each}
            {/if}
          </div>
        </div>

        <div
          class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-3"
        >
          <h2
            class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
          >
            Order Status
          </h2>
          <div class="space-y-2 text-[11px]">
            {#if !summary.perOrderStatus.length}
              <p class="text-white/40">Tidak ada data.</p>
            {:else}
              {#each summary.perOrderStatus as row}
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span
                      class={`inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border ${badgeColor(
                        row.orderStatus || "",
                      )}`}
                    >
                      {row.orderStatus}
                    </span>
                  </div>
                  <p class="text-white/70">
                    {row.count.toLocaleString("id-ID")}
                  </p>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div
        class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 md:p-4 md:col-span-2"
      >
        <div class="flex items-center justify-between mb-3 text-xs">
          <h2
            class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
          >
            Omzet per Sub Kategori
          </h2>
          <p class="text-[10px] text-white/40">
            Diurutkan dari total nominal (semua status) terbesar ke terkecil.
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-[11px]">
            <thead class="bg-white/5">
              <tr>
                <th class="px-3 py-2 font-semibold text-white/60">
                  Sub Kategori
                </th>
                <th class="px-3 py-2 font-semibold text-white/60">
                  Kategori
                </th>
                <th class="px-3 py-2 font-semibold text-white/60">
                  Trx (Semua)
                </th>
                <th class="px-3 py-2 font-semibold text-white/60">
                  Omzet (Semua)
                </th>
                <th class="px-3 py-2 font-semibold text-white/60">
                  Trx Payment Sukses
                </th>
                <th class="px-3 py-2 font-semibold text-white/60">
                  Omzet Payment Sukses
                </th>
                <th class="px-3 py-2 font-semibold text-white/60">
                  Trx Tuntas
                </th>
                <th class="px-3 py-2 font-semibold text-white/60">
                  Omzet Tuntas
                </th>
              </tr>
            </thead>
            <tbody>
              {#if !summary.perSubCategory?.length}
                <tr>
                  <td colspan="8" class="px-3 py-4 text-center text-white/40">
                    Belum ada data sub kategori untuk rentang ini.
                  </td>
                </tr>
              {:else}
                {#each summary.perSubCategory as row}
                  <tr class="border-t border-white/5 hover:bg-white/[0.03]">
                    <td class="px-3 py-2 align-top text-white/80">
                      <p class="text-xs font-semibold">
                        {row.subCategoryTitle}
                      </p>
                      <p class="text-[10px] text-white/40">
                        ID: {row.subCategoryId}
                      </p>
                    </td>
                    <td class="px-3 py-2 align-top text-white/70">
                      {row.categoryTitle ?? "-"}
                    </td>
                    <td class="px-3 py-2 align-top text-white/70">
                      {row.totalTransactionsAll.toLocaleString("id-ID")}
                    </td>
                    <td class="px-3 py-2 align-top text-white/80">
                      {formatCurrency(row.sumAll)}
                    </td>
                    <td class="px-3 py-2 align-top text-white/70">
                      {row.totalTransactionsPaymentSuccess.toLocaleString(
                        "id-ID",
                      )}
                    </td>
                    <td class="px-3 py-2 align-top text-white/80">
                      {formatCurrency(row.sumPaymentSuccess)}
                    </td>
                    <td class="px-3 py-2 align-top text-white/70">
                      {row.totalTransactionsFullySuccess.toLocaleString(
                        "id-ID",
                      )}
                    </td>
                    <td class="px-3 py-2 align-top text-white/80">
                      {formatCurrency(row.sumFullySuccess)}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3">
          <div class="flex items-center justify-between mb-3 text-xs">
            <h2
              class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
            >
              Alert Admin
            </h2>
            <p class="text-[10px] text-white/40">butuh perhatian</p>
          </div>
          <div class="space-y-2">
            {#if !summary.alerts?.length}
              <p class="text-[11px] text-white/40">belum ada alert penting.</p>
            {:else}
              {#each summary.alerts ?? [] as alert}
                <div
                  class={`rounded-xl border px-3 py-2 text-[11px] ${alertColor(alert.level)}`}
                >
                  {alert.message}
                </div>
              {/each}
            {/if}
          </div>
        </div>

        <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3">
          <div class="flex items-center justify-between mb-3 text-xs">
            <h2
              class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
            >
              Conversion Funnel
            </h2>
            <p class="text-[10px] text-white/40">alur transaksi</p>
          </div>
          <div class="space-y-2 text-[11px]">
            <div
              class="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2"
            >
              <span class="text-white/60">Total dibuat</span>
              <span class="font-semibold text-white"
                >{summary.funnel?.totalCreated.toLocaleString("id-ID") ??
                  "0"}</span
              >
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2"
            >
              <span class="text-emerald-200">Payment sukses</span>
              <span class="font-semibold text-emerald-100"
                >{summary.funnel?.paymentSuccess.toLocaleString("id-ID") ??
                  "0"}</span
              >
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-sky-500/10 px-3 py-2"
            >
              <span class="text-sky-200">Order sukses</span>
              <span class="font-semibold text-sky-100"
                >{summary.funnel?.orderSuccess.toLocaleString("id-ID") ??
                  "0"}</span
              >
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2"
            >
              <span class="text-amber-200">Menunggu bayar</span>
              <span class="font-semibold text-amber-100"
                >{summary.funnel?.waitPayment.toLocaleString("id-ID") ??
                  "0"}</span
              >
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-2"
            >
              <span class="text-red-200">Payment gagal</span>
              <span class="font-semibold text-red-100"
                >{summary.funnel?.paymentFailed.toLocaleString("id-ID") ??
                  "0"}</span
              >
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-2"
            >
              <span class="text-red-200">Order gagal</span>
              <span class="font-semibold text-red-100"
                >{summary.funnel?.orderFailed.toLocaleString("id-ID") ??
                  "0"}</span
              >
            </div>
          </div>
        </div>

        <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3">
          <div class="flex items-center justify-between mb-3 text-xs">
            <h2
              class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
            >
              Top Products
            </h2>
            <p class="text-[10px] text-white/40">berdasarkan omzet</p>
          </div>
          <div class="space-y-2">
            {#if !summary.topProducts?.length}
              <p class="text-[11px] text-white/40">belum ada data produk.</p>
            {:else}
              {#each summary.topProducts ?? [] as product, index}
                <div
                  class="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2"
                >
                  <div class="min-w-0 flex items-center gap-3">
                    <span class="text-[10px] text-white/40 w-4"
                      >#{index + 1}</span
                    >
                    <div class="min-w-0">
                      <p class="text-xs font-semibold text-white truncate">
                        {product.title}
                      </p>
                      <p class="text-[10px] text-white/40">
                        {product.count.toLocaleString("id-ID")} trx
                      </p>
                    </div>
                  </div>
                  <p class="text-[11px] font-semibold text-white">
                    {formatCurrency(product.sum)}
                  </p>
                </div>
              {/each}
            {/if}
          </div>
        </div>

        <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3">
          <div class="flex items-center justify-between mb-3 text-xs">
            <h2
              class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
            >
              Top Subcategory
            </h2>
            <p class="text-[10px] text-white/40">5 teratas</p>
          </div>
          <div class="space-y-2">
            {#if !summary.topSubCategories?.length}
              <p class="text-[11px] text-white/40">
                belum ada data sub kategori.
              </p>
            {:else}
              {#each summary.topSubCategories ?? [] as sub, index}
                <div
                  class="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2"
                >
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-white truncate">
                      #{index + 1}
                      {sub.subCategoryTitle}
                    </p>
                    <p class="text-[10px] text-white/40 truncate">
                      {sub.categoryTitle ?? "-"} Â· {sub.totalTransactionsAll.toLocaleString(
                        "id-ID",
                      )} trx
                    </p>
                  </div>
                  <p class="text-[11px] font-semibold text-white">
                    {formatCurrency(sub.sumAll)}
                  </p>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 md:p-4">
        <div class="flex items-center justify-between mb-3 text-xs">
          <h2
            class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
          >
            Tren Transaksi 7 Hari
          </h2>
          <p class="text-[10px] text-white/40">
            jumlah transaksi harian Â· pay {paymentStatusFilter} Â· order {orderStatusFilter}
          </p>
        </div>
        <div class="grid grid-cols-7 gap-2 items-end min-h-[180px]">
          {#each summary.trends ?? [] as item}
            <div class="flex flex-col items-center justify-end gap-2">
              <div
                class="w-full max-w-[42px] rounded-t-lg bg-[var(--color-primary)]/80 min-h-[8px]"
                style={`height:${Math.max((item.totalTransactions / maxTrendTransactions()) * 140, 8)}px`}
              ></div>
              <p class="text-[10px] text-white/70">{item.totalTransactions}</p>
              <p class="text-[10px] text-white/40 text-center">
                {formatShortDate(item.date)}
              </p>
            </div>
          {/each}
        </div>
      </div>

      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 md:p-4">
        <div class="flex items-center justify-between mb-3 text-xs">
          <h2
            class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
          >
            Tren Omzet 7 Hari
          </h2>
          <p class="text-[10px] text-white/40">
            nominal harian Â· pay {paymentStatusFilter} Â· order {orderStatusFilter}
          </p>
        </div>
        <div class="grid grid-cols-7 gap-2 items-end min-h-[180px]">
          {#each summary.trends ?? [] as item}
            <div class="flex flex-col items-center justify-end gap-2">
              <div
                class="w-full max-w-[42px] rounded-t-lg bg-emerald-400/80 min-h-[8px]"
                style={`height:${Math.max((item.totalRevenue / maxTrendRevenue()) * 140, 8)}px`}
              ></div>
              <p class="text-[10px] text-white/70 text-center">
                {formatCurrency(item.totalRevenue)}
              </p>
              <p class="text-[10px] text-white/40 text-center">
                {formatShortDate(item.date)}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Per payment method -->
    <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 md:p-4">
      <div class="flex items-center justify-between mb-3 text-xs">
        <h2
          class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
        >
          Omzet per Metode Pembayaran
        </h2>
        <p class="text-[10px] text-white/40">
          Perbandingan total transaksi, payment sukses, dan tuntas per metode.
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-[11px]">
          <thead class="bg-white/5">
            <tr>
              <th class="px-3 py-2 font-semibold text-white/60"> Metode </th>
              <th class="px-3 py-2 font-semibold text-white/60"> Group </th>
              <th class="px-3 py-2 font-semibold text-white/60">
                Trx (Semua)
              </th>
              <th class="px-3 py-2 font-semibold text-white/60">
                Omzet (Semua)
              </th>
              <th class="px-3 py-2 font-semibold text-white/60">
                Trx Payment Sukses
              </th>
              <th class="px-3 py-2 font-semibold text-white/60">
                Omzet Payment Sukses
              </th>
              <th class="px-3 py-2 font-semibold text-white/60">
                Trx Tuntas
              </th>
              <th class="px-3 py-2 font-semibold text-white/60">
                Omzet Tuntas
              </th>
            </tr>
          </thead>
          <tbody>
            {#if !summary.perPaymentMethod.length}
              <tr>
                <td colspan="8" class="px-3 py-4 text-center text-white/40">
                  Tidak ada data payment method.
                </td>
              </tr>
            {:else}
              {#each summary.perPaymentMethod as pm}
                <tr class="border-t border-white/5 hover:bg-white/[0.03]">
                  <td class="px-3 py-2 align-top">
                    <div class="flex items-center gap-2">
                      {#if pm.thumbnail}
                        <img
                          src={pm.thumbnail}
                          alt={pm.paymentName}
                          class="w-7 h-7 rounded-md object-contain bg-white"
                          loading="lazy"
                        />
                      {/if}
                      <div class="min-w-0">
                        <p class="text-xs font-semibold text-white truncate">
                          {pm.paymentName}
                        </p>
                        <p class="text-[10px] text-white/40">
                          {pm.methodCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-2 align-top text-white/70">
                    {pm.group ?? "-"}
                  </td>
                  <td class="px-3 py-2 align-top text-white/70">
                    {pm.countAll.toLocaleString("id-ID")}
                  </td>
                  <td class="px-3 py-2 align-top text-white/80">
                    {formatCurrency(pm.sumAll)}
                  </td>
                  <td class="px-3 py-2 align-top text-white/70">
                    {pm.countPaymentSuccess.toLocaleString("id-ID")}
                  </td>
                  <td class="px-3 py-2 align-top text-white/80">
                    {formatCurrency(pm.sumPaymentSuccess)}
                  </td>
                  <td class="px-3 py-2 align-top text-white/70">
                    {pm.countFullySuccess.toLocaleString("id-ID")}
                  </td>
                  <td class="px-3 py-2 align-top text-white/80">
                    {formatCurrency(pm.sumFullySuccess)}
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
  {#if toastMessage}
    <div
      class="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-xs font-semibold shadow-lg backdrop-blur-sm"
    >
      {toastMessage}
    </div>
  {/if}
</section>
