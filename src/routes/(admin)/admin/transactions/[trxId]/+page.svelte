<script lang="ts">
  const { data } = $props();
  const trx = data.transaction;

  function formatDate(iso: string | null) {
    if (!iso) return "-";
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
            <div class="pt-2">
              <p
                class="text-[10px] text-white/40 uppercase tracking-[0.14em] mb-1"
              >
                Provider Data
              </p>
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
