<script lang="ts">
  import { invalidateAll } from "$app/navigation";

  const { data } = $props();
  let trx = $state(data.transaction);
  const token: string | null = data.token ?? null;

  let actionPaymentStatus = $state(trx?.paymentStatus ?? "");
  let actionOrderStatus = $state(trx?.orderStatus ?? "");
  let actionLoading = $state(false);
  let actionError = $state<string | null>(null);
  let actionSuccess = $state<string | null>(null);
  let confirmDialogOpen = $state(false);
  let confirmTitle = $state("");
  let confirmMessage = $state("");
  let confirmAction = $state<null | (() => Promise<void>)>(null);

  const paymentStatusOptions = ["PENDING", "SUCCESS", "FAILED", "REFUND"];
  const orderStatusOptions = ["WAIT_PAYMENT", "PENDING", "SUCCESS", "FAILED"];

  function getProviderData() {
    return trx?.providerData && typeof trx.providerData === "object" ? trx.providerData as Record<string, any> : {};
  }

  function getRetryRefId() {
    return getProviderData().retryRefId ?? null;
  }

  function getRetryCount() {
    return Number(getProviderData().retryCount ?? 0);
  }

  function getRetryHistory() {
    const history = getProviderData().retryHistory;
    return Array.isArray(history) ? [...history].reverse() : [];
  }

  function canRetryOrder() {
    return !actionLoading && trx?.paymentStatus === "SUCCESS" && trx?.orderStatus !== "PENDING";
  }

  function formatDate(iso: string | null | undefined) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function formatCurrency(v: string | number | null | undefined) {
    if (v === null || v === undefined || v === "") return "-";
    const n = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n)) return "-";
    return n.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  }

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

  async function runAdminAction(payload: Record<string, unknown>, successMessage: string) {
    if (!trx?.trxId) return;

    actionLoading = true;
    actionError = null;
    actionSuccess = null;

    try {
      const res = await fetch(`/api/v1/transactions/${trx.trxId}/admin-action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.data?.message ?? json?.message ?? "Gagal update transaksi");
      }

      trx = json.data.transaction;
      actionPaymentStatus = trx?.paymentStatus ?? "";
      actionOrderStatus = trx?.orderStatus ?? "";
      actionSuccess = successMessage;
      await invalidateAll();
    } catch (e: any) {
      actionError = e?.message ?? "Gagal update transaksi";
    } finally {
      actionLoading = false;
      closeConfirmDialog();
    }
  }

  function openConfirmDialog(title: string, message: string, action: () => Promise<void>) {
    confirmTitle = title;
    confirmMessage = message;
    confirmAction = action;
    confirmDialogOpen = true;
  }

  function closeConfirmDialog() {
    confirmDialogOpen = false;
    confirmTitle = "";
    confirmMessage = "";
    confirmAction = null;
  }

  function saveAdminAction() {
    openConfirmDialog(
      "Simpan perubahan status",
      `Yakin mau ubah payment ke ${actionPaymentStatus} dan order ke ${actionOrderStatus}?`,
      () => runAdminAction(
        {
          paymentStatus: actionPaymentStatus,
          orderStatus: actionOrderStatus,
        },
        "Perubahan transaksi berhasil disimpan",
      ),
    );
  }

  function applyPreset(paymentStatus: string, orderStatus: string, label: string) {
    openConfirmDialog(
      `Pakai preset ${label}`,
      `Yakin mau set payment ${paymentStatus} dan order ${orderStatus}?`,
      () => runAdminAction(
        {
          paymentStatus,
          orderStatus,
        },
        `Preset ${label} berhasil diterapkan`,
      ),
    );
  }

  function retryOrder() {
    openConfirmDialog(
      "Retry order",
      "Yakin mau retry order ini? Status order akan direset ke PENDING. Hanya cocok untuk payment yang sudah SUCCESS.",
      () => runAdminAction(
        {
          action: "retry_order",
        },
        "Retry order berhasil dijalankan",
      ),
    );
  }
</script>

{#if !trx}
  <section class="space-y-4">
    <h1 class="text-lg font-semibold text-white">Detail Transaksi</h1>
    <p class="text-xs text-red-400">{data.error}</p>
  </section>
{:else}
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
          Detail Transaksi
        </h1>
        <p class="text-xs md:text-sm text-white/50 mt-1 max-w-xl">
          Ringkasan lengkap transaksi {trx.trxId}.
        </p>
      </div>
    </header>

    <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-xs font-semibold text-white uppercase tracking-[0.16em]">Aksi Cepat Admin</h2>
          <p class="text-[11px] text-white/50 mt-1">Ubah status manual untuk transaksi ini dengan cepat dari halaman detail.</p>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2 text-[11px]">
        <label class="flex flex-col gap-1">
          <span class="text-white/60">Payment Status</span>
          <select class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[#f5c518]" bind:value={actionPaymentStatus}>
            {#each paymentStatusOptions as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-white/60">Order Status</span>
          <select class="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-[#f5c518]" bind:value={actionOrderStatus}>
            {#each orderStatusOptions as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
        </label>

      </div>

      <div class="space-y-2">
        <p class="text-[10px] uppercase tracking-[0.14em] text-white/40">Preset Cepat</p>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="px-3 py-2 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20" onclick={() => applyPreset("SUCCESS", "SUCCESS", "Sukses")}>Tandai Sukses</button>
          <button type="button" class="px-3 py-2 rounded-lg text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20" onclick={() => applyPreset("PENDING", "PENDING", "Pending")}>Reset Pending</button>
          <button type="button" class="px-3 py-2 rounded-lg text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/20" onclick={() => applyPreset("FAILED", "FAILED", "Gagal")}>Tandai Gagal</button>
          <button type="button" class="px-3 py-2 rounded-lg text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed" onclick={retryOrder} disabled={!canRetryOrder()}>Retry Order</button>
        </div>
        <div class="grid gap-2 md:grid-cols-2 text-[11px] text-white/60">
          <p><span class="text-white/40">Retry Count:</span> {getRetryCount()}</p>
          <p><span class="text-white/40">Retry Ref ID:</span> {getRetryRefId() ?? "-"}</p>
        </div>
        {#if trx.orderStatus === "PENDING"}
          <p class="text-[11px] text-amber-300">Retry dinonaktifkan sementara karena order masih status PENDING.</p>
        {/if}
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="px-3 py-2 rounded-lg font-semibold bg-[#f5c518] text-black hover:bg-[#ffd740] text-[11px] disabled:opacity-60"
          onclick={saveAdminAction}
          disabled={actionLoading}
        >
          {actionLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>

        {#if actionSuccess}
          <p class="text-[11px] text-emerald-300">{actionSuccess}</p>
        {/if}
        {#if actionError}
          <p class="text-[11px] text-red-300">{actionError}</p>
        {/if}
      </div>
    </div>

    {#if confirmDialogOpen}
      <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-5 space-y-4 shadow-2xl">
          <div>
            <h3 class="text-sm font-bold text-white">{confirmTitle}</h3>
            <p class="text-xs text-white/60 mt-1">{confirmMessage}</p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-3 py-2 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 text-[11px]"
              onclick={closeConfirmDialog}
              disabled={actionLoading}
            >
              Batal
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded-lg bg-[#f5c518] text-black font-semibold hover:bg-[#ffd740] text-[11px] disabled:opacity-60"
              onclick={async () => await confirmAction?.()}
              disabled={actionLoading}
            >
              {actionLoading ? "Proses..." : "Ya, lanjut"}
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Ringkasan utama -->
    <div class="grid gap-4 md:grid-cols-3">
      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-3">
        <h2
          class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
        >
          Info Transaksi
        </h2>
        <div class="space-y-1 text-[11px] text-white/70">
          <p><span class="text-white/40">Trx ID:</span> {trx.trxId}</p>
          <p><span class="text-white/40">Internal ID:</span> {trx.id}</p>
          <p>
            <span class="text-white/40">Status Payment:</span>
            <span
              class={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] ${statusColor(
                trx.paymentStatus,
              )}`}
            >
              {trx.paymentStatus}
            </span>
          </p>
          <p>
            <span class="text-white/40">Status Order:</span>
            <span
              class={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] ${statusColor(
                trx.orderStatus,
              )}`}
            >
              {trx.orderStatus}
            </span>
          </p>
          <p>
            <span class="text-white/40">Dibuat:</span>
            {" "}
            {formatDate(trx.createdAt)}
          </p>
          <p>
            <span class="text-white/40">Update:</span>
            {" "}
            {formatDate(trx.updatedAt)}
          </p>
          <p>
            <span class="text-white/40">Retry Count:</span>
            {" "}
            {getRetryCount()}
          </p>
          <p>
            <span class="text-white/40">Retry Ref ID:</span>
            {" "}
            {getRetryRefId() ?? "-"}
          </p>
        </div>
      </div>

      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-3">
        <h2
          class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
        >
          Pembayaran
        </h2>
        <div class="space-y-2 text-[11px] text-white/70">
          {#if trx.paymentMethod}
            <div class="flex items-center gap-2">
              {#if trx.paymentMethod.thumbnail}
                <img
                  src={trx.paymentMethod.thumbnail}
                  alt={trx.paymentMethod.paymentName}
                  class="w-8 h-8 rounded-md object-contain bg-white"
                  loading="lazy"
                />
              {/if}
              <div class="min-w-0">
                <p class="text-xs font-semibold text-white truncate">
                  {trx.paymentMethod.paymentName}
                </p>
                <p class="text-[10px] text-white/40">
                  {trx.paymentMethod.methodCode} · {trx.paymentMethod.group}
                </p>
              </div>
            </div>
          {/if}

          <p>
            <span class="text-white/40">Total:</span>
            {" "}
            {formatCurrency(trx.totalPrice)}
          </p>
          <p>
            <span class="text-white/40">Harga:</span>
            {" "}
            {formatCurrency(trx.price)}
            {" · "}
            <span class="text-white/40">Fee:</span>
            {" "}
            {formatCurrency(trx.fee)}
          </p>
          <p>
            <span class="text-white/40">Diskon:</span>
            {" "}
            {formatCurrency(trx.discount ?? 0)}
          </p>
          <p>
            <span class="text-white/40">Setelah diskon:</span>
            {" "}
            {formatCurrency(trx.discountedPrice ?? trx.totalPrice)}
          </p>

          {#if trx.paymentDetails}
            <div class="pt-2 space-y-1">
              <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
                Payment Details
              </p>
              <p>
                <span class="text-white/40">Amount gateway:</span>
                {" "}
                {formatCurrency(trx.paymentDetails.amount)}
              </p>
              {#if trx.paymentDetails.vaNumber}
                <p>
                  <span class="text-white/40">VA Number:</span>
                  {" "}
                  {trx.paymentDetails.vaNumber}
                </p>
              {/if}
              {#if trx.paymentDetails.reference}
                <p class="break-all">
                  <span class="text-white/40">Reference:</span>
                  {" "}
                  {trx.paymentDetails.reference}
                </p>
              {/if}
              {#if trx.paymentDetails.statusMessage}
                <p>
                  <span class="text-white/40">Gateway status:</span>
                  {" "}
                  {trx.paymentDetails.statusMessage}
                  {" "}
                  ({trx.paymentDetails.statusCode})
                </p>
              {/if}
              {#if trx.paymentDetails.paymentUrl}
                <p class="truncate">
                  <span class="text-white/40">Payment URL:</span>
                  {" "}
                  <a
                    href={trx.paymentDetails.paymentUrl}
                    target="_blank"
                    class="text-[#f5c518] underline">open</a
                  >
                </p>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-3">
        <h2
          class="text-xs font-semibold text-white uppercase tracking-[0.16em]"
        >
          User & Provider
        </h2>
        <div class="space-y-2 text-[11px] text-white/70">
          <div>
            <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">
              User
            </p>
            {#if trx.userAccountData}
              <p>Primary ID: {trx.userAccountData.primary_id}</p>
              <p>Server ID: {trx.userAccountData.server_id}</p>
            {/if}
            {#if trx.phoneNumber}
              <p>Phone: {trx.phoneNumber}</p>
            {/if}
            {#if trx.email}
              <p>Email: {trx.email}</p>
            {/if}
            {#if !trx.userAccountData && !trx.phoneNumber && !trx.email}
              <p class="text-white/40">Tidak ada data user.</p>
            {/if}
          </div>

          {#if trx.providerData}
            <div class="pt-2 space-y-2">
              <div>
                <p
                  class="text-[10px] text-white/40 uppercase tracking-[0.14em] mb-1"
                >
                  Provider Data
                </p>
                <p>Last Ref ID: {trx.providerData.lastRefId ?? trx.providerData.retryRefId ?? trx.trxId}</p>
                <p>RC: {trx.providerData.rc}</p>
                <p>SN: {trx.providerData.sn}</p>
                <p>Harga Provider: {formatCurrency(trx.providerData.price)}</p>
                <p>Pesan: {trx.providerData.message}</p>
                <p>
                  Saldo buyer terakhir:
                  {" "}
                  {formatCurrency(trx.providerData.buyer_last_saldo)}
                </p>
              </div>

              {#if getRetryHistory().length > 0}
                <div class="pt-2 border-t border-white/10 space-y-2">
                  <p class="text-[10px] text-white/40 uppercase tracking-[0.14em]">Riwayat Retry</p>
                  <div class="space-y-2 max-h-72 overflow-auto pr-1">
                    {#each getRetryHistory() as retry}
                      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-1">
                        <div class="flex items-center justify-between gap-2 flex-wrap">
                          <p class="text-white text-[11px] font-semibold">Attempt #{retry.attempt ?? "-"}</p>
                          <span class={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] ${statusColor(retry.callbackStatus === "Sukses" ? "SUCCESS" : retry.callbackStatus === "Gagal" ? "FAILED" : "PENDING")}`}>
                            {retry.callbackStatus ?? retry.requestStatus ?? "PENDING"}
                          </span>
                        </div>
                        <p class="break-all"><span class="text-white/40">Ref ID:</span> {retry.refId ?? "-"}</p>
                        <p><span class="text-white/40">Request At:</span> {formatDate(retry.requestedAt ?? null)}</p>
                        <p><span class="text-white/40">Callback At:</span> {formatDate(retry.callbackAt ?? null)}</p>
                        <p><span class="text-white/40">RC:</span> {retry.rc ?? "-"}</p>
                        <p><span class="text-white/40">SN:</span> {retry.sn ?? "-"}</p>
                        <p><span class="text-white/40">Pesan:</span> {retry.callbackMessage ?? retry.requestMessage ?? "-"}</p>

                        <details class="mt-2 rounded-lg border border-white/10 bg-black/20 p-2">
                          <summary class="cursor-pointer text-[10px] text-[#f5c518]">Lihat raw response</summary>
                          <pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-[10px] text-white/65">{JSON.stringify(retry.response ?? retry, null, 2)}</pre>
                        </details>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Detail produk -->
    <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 space-y-3">
      <h2 class="text-xs font-semibold text-white uppercase tracking-[0.16em]">
        Produk
      </h2>
      {#if trx.product}
        <div class="flex gap-3 text-[11px] text-white/70">
          {#if trx.product.thumbnails}
            <img
              src={trx.product.thumbnails}
              alt={trx.product.title}
              class="w-16 h-16 rounded-md object-cover"
              loading="lazy"
            />
          {/if}
          <div class="space-y-1">
            <p class="text-xs font-semibold text-white">
              {trx.product.title}
            </p>
            <p class="text-white/40">SKU: {trx.product.skuCode}</p>
            <p>Harga: {formatCurrency(trx.product.price)}</p>
            <p class="text-white/40 text-[10px]">
              {trx.product.description}
            </p>
          </div>
        </div>
      {:else}
        <p class="text-[11px] text-white/50">Data produk tidak tersedia.</p>
      {/if}
    </div>

    <!-- JSON mentah (optional debug) -->
    <!--
    <details class="bg-black/40 border border-white/10 rounded-2xl p-3 text-[10px] text-white/60">
      <summary class="cursor-pointer text-xs text-white/70">Lihat raw JSON</summary>
      <pre class="mt-2 overflow-x-auto whitespace-pre-wrap">
{JSON.stringify(trx, null, 2)}
      </pre>
    </details>
    -->
  </section>
{/if}
