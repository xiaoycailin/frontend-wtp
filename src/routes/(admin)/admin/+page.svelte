<script lang="ts">
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

  type Summary = {
    // field-field yang sudah ada (totalCount, grossFullySuccess, dll) ...
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
  };

  const { data } = $props();
  const token: string | null = data.token ?? null;

  let summary = $state<Summary | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  let from = $state("");
  let to = $state("");

  function formatCurrency(v: number) {
    if (!v) return "Rp 0";
    return v.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  }

  async function fetchSummary() {
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());

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
      summary = json.data;
    } catch (e: any) {
      error = e?.message ?? "Terjadi kesalahan saat memuat summary";
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchSummary();
  });

  function resetFilter() {
    from = "";
    to = "";
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
</script>

<section class="space-y-6">
  <header
    class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
  >
    <div>
      <p
        class="text-xs font-semibold text-[#f5c518] uppercase tracking-[0.18em] mb-1"
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
    <div class="flex items-center gap-2 text-xs">
      <button
        type="button"
        class="px-3 py-2 rounded-lg font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
        onclick={resetFilter}
      >
        Reset Tanggal
      </button>
      <button
        type="button"
        class="px-3 py-2 rounded-lg font-semibold bg-[#f5c518] text-black hover:bg-[#ffd740]"
        onclick={fetchSummary}
      >
        Terapkan
      </button>
    </div>
  </header>

  <!-- Filter tanggal -->
  <div
    class="bg-[#0c0c0c] border border-white/10 rounded-2xl p-3 md:p-4 space-y-3 text-[11px]"
  >
    <div class="grid gap-3 md:grid-cols-3 items-end">
      <label class="flex flex-col gap-1">
        <span class="text-white/60">Dari tanggal</span>
        <input
          type="date"
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[#f5c518]"
          bind:value={from}
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-white/60">Sampai tanggal</span>
        <input
          type="date"
          class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[#f5c518]"
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
          class="flex-1 px-3 py-2 rounded-lg font-semibold bg-[#f5c518] text-black hover:bg-[#ffd740]"
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
    <!-- Kartu angka utama -->
    <!-- Kartu angka utama -->
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
          {" · "}
          PENDING:
          {" "}
          {summary.totalPaymentPendingCount.toLocaleString("id-ID")}
          {" · "}
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

    <!-- Distribusi status -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-3">
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

      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 space-y-3">
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

    <!-- Per sub kategori -->
    <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-3 md:p-4">
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
              <th class="px-3 py-2 font-semibold text-white/60"> Kategori </th>
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
                    {row.totalTransactionsFullySuccess.toLocaleString("id-ID")}
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
</section>
