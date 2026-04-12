<script lang="ts">
  const { data } = $props();
  const transaction = data;

  function formatDate(iso: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date(iso));
  }

  function formatRp(val: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(val));
  }

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    PENDING: {
      label: "Sedang Diproses",
      color: "#f5c518",
      bg: "rgba(245,197,24,0.12)",
    },
    SUCCESS: {
      label: "Berhasil",
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
    },
    FAILED: { label: "Gagal", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
    WAIT_PAYMENT: {
      label: "Belum Dibayar",
      color: "#f5c518",
      bg: "rgba(245,197,24,0.12)",
    },
    PROCESSING: {
      label: "Diproses",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.12)",
    },
    COMPLETED: {
      label: "Selesai",
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
    },
  };

  const payStatus =
    statusConfig[transaction.paymentStatus] ?? statusConfig["PENDING"];
  const ordStatus =
    statusConfig[transaction.orderStatus] ?? statusConfig["WAIT_PAYMENT"];

  const basePrice = Number(transaction.price);
  const discount = Number(transaction.discount ?? 0);
  const discountedPrice = Number(transaction.discountedPrice ?? basePrice);
  const fee = Math.round(transaction.fee);
  const totalPrice = Number(transaction.totalPrice);
  const isFlashSale = !!transaction.flashSaleId;

  // ── Deteksi tipe pembayaran ──────────────────────────────────────
  const hasQris = !!transaction.paymentDetails?.qrString;
  const hasVa = !!transaction.paymentDetails?.vaNumber;

  // ── Payment method dari server ───────────────────────────────────
  const pm = transaction.paymentMethod ?? null;
  const pmGroup = pm?.group ?? (hasQris ? "qris" : hasVa ? "va" : null);
  const pmBadgeClass =
    pmGroup === "qris"
      ? "qris-badge"
      : pmGroup === "va"
        ? "va-badge"
        : pmGroup === "ewallet"
          ? "ewallet-badge"
          : "default-badge";
  const pmBadgeLabel =
    pmGroup === "qris"
      ? "QRIS"
      : pmGroup === "va"
        ? "Virtual Account"
        : pmGroup === "ewallet"
          ? "E-Wallet"
          : (pmGroup ?? "Pembayaran")?.toUpperCase();

  // Untuk copy VA number
  let copied = $state(false);
  async function copyVa() {
    await navigator.clipboard.writeText(transaction.paymentDetails.vaNumber);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<svelte:head>
  <title>Invoice - {transaction.trxId}</title>
</svelte:head>

<div class="page">
  <!-- ── Header brand ──────────────────────────────────────────── -->
  <header class="brand-header">
    <div class="brand-logo">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#f5c518" />
        <path d="M7 8h4l3 8 3-8h4l-5 12h-4L7 8z" fill="#000" stroke="none" />
      </svg>
      <span>WTPANJAY</span>
    </div>
    <div class="brand-right">
      <span class="inv-label">INVOICE</span>
      <span class="inv-id">#{transaction.trxId}</span>
    </div>
  </header>

  <!-- ── Status banner ─────────────────────────────────────────── -->
  <div
    class="status-banner"
    style="background:{payStatus.bg}; border-color:{payStatus.color}33;"
  >
    <div class="status-dot" style="background:{payStatus.color};"></div>
    <div>
      <p class="status-main" style="color:{payStatus.color};">
        {payStatus.label}
      </p>
      <p class="status-sub">
        Order: <span style="color:{ordStatus.color};">{ordStatus.label}</span>
      </p>
    </div>
    {#if transaction.paymentStatus === "PENDING"}
      <a
        href={transaction.paymentDetails.paymentUrl}
        target="_blank"
        rel="noopener"
        class="pay-btn"
      >
        Bayar Sekarang →
      </a>
    {/if}
  </div>

  <!-- ── Main grid ─────────────────────────────────────────────── -->
  <div class="main-grid">
    <!-- Kiri: detail transaksi -->
    <div class="left-col">
      <!-- Produk -->
      <section class="card">
        <p class="card-label">Item yang Dipesan</p>
        <div class="product-row">
          <img
            src={transaction.product.thumbnails}
            alt={transaction.product.title}
            width="52"
            height="52"
            class="product-img"
          />
          <div class="product-info">
            <p class="product-name">{transaction.product.title}</p>
            <p class="product-desc">{transaction.product.description}</p>
            <div class="product-badges">
              {#if isFlashSale}<span class="badge flash">⚡ Flash Sale</span
                >{/if}
              {#if transaction.product.instant}<span class="badge instant"
                  >⚡ Instan</span
                >{/if}
            </div>
          </div>
          <div class="product-qty">
            <span class="qty-label">×{transaction.quantity}</span>
          </div>
        </div>
      </section>

      <!-- Data akun -->
      <section class="card">
        <p class="card-label">Data Akun</p>
        <div class="info-list">
          {#if transaction.userAccountData.username}
            <div class="info-row">
              <span class="info-key">Username</span>
              <span class="info-val"
                >{transaction.userAccountData.username}</span
              >
            </div>
          {/if}
          <div class="info-row">
            <span class="info-key">User ID</span>
            <span class="info-val"
              >{transaction.userAccountData.primary_id}</span
            >
          </div>
          {#if transaction.userAccountData.server_id}
            <div class="info-row">
              <span class="info-key">Server ID</span>
              <span class="info-val"
                >{transaction.userAccountData.server_id}</span
              >
            </div>
          {/if}
          {#if transaction.phoneNumber}
            <div class="info-row">
              <span class="info-key">No. WhatsApp</span>
              <span class="info-val">{transaction.phoneNumber}</span>
            </div>
          {/if}
          {#if transaction.email}
            <div class="info-row">
              <span class="info-key">Email</span>
              <span class="info-val">{transaction.email}</span>
            </div>
          {/if}
        </div>
      </section>

      <!-- Info transaksi -->
      <section class="card">
        <p class="card-label">Info Transaksi</p>
        <div class="info-list">
          <div class="info-row">
            <span class="info-key">Order ID</span>
            <span class="info-val mono">{transaction.trxId}</span>
          </div>
          <div class="info-row">
            <span class="info-key">Referensi</span>
            <span class="info-val mono"
              >{transaction.paymentDetails.reference}</span
            >
          </div>
          <div class="info-row">
            <span class="info-key">Tanggal</span>
            <span class="info-val">{formatDate(transaction.createdAt)}</span>
          </div>
          {#if transaction.serialNumber}
            <div class="info-row">
              <span class="info-key">Serial Number</span>
              <span class="info-val mono">{transaction.serialNumber}</span>
            </div>
          {/if}
          {#if transaction.orderNotes}
            <div class="info-row">
              <span class="info-key">Catatan</span>
              <span class="info-val">{transaction.orderNotes}</span>
            </div>
          {/if}
        </div>
      </section>
    </div>

    <!-- Kanan: ringkasan harga + metode bayar -->
    <div class="right-col">
      <!-- Ringkasan harga -->
      <section class="card highlight-card">
        <p class="card-label">Ringkasan Pembayaran</p>
        <div class="price-list">
          <div class="price-row">
            <span>Harga satuan</span>
            <span>{formatRp(basePrice)}</span>
          </div>
          {#if transaction.quantity > 1}
            <div class="price-row">
              <span>Jumlah</span>
              <span>×{transaction.quantity}</span>
            </div>
          {/if}
          {#if isFlashSale && discount > 0}
            <div class="price-row discount">
              <span class="flex-row">
                <span class="badge flash sm">⚡ FLASH</span>
                Diskon Flash Sale
              </span>
              <span>-{formatRp(discount)}</span>
            </div>
          {/if}
          {#if fee > 0}
            <div class="price-row">
              <span>Biaya Admin</span>
              <span>+{formatRp(fee)}</span>
            </div>
          {:else}
            <div class="price-row free">
              <span>Biaya Layanan</span>
              <span>Gratis</span>
            </div>
          {/if}
        </div>
        <div class="price-total">
          <span>Total Pembayaran</span>
          <span class="total-amount">{formatRp(totalPrice)}</span>
        </div>
      </section>

      <!-- ── QRIS ────────────────────────────────────────────────── -->
      {#if hasQris}
        <section class="card payment-method-card">
          <!-- Header: badge + logo + nama metode bayar -->
          <div class="pm-header">
            <span class="pm-type-badge {pmBadgeClass}">{pmBadgeLabel}</span>
            {#if pm?.thumbnail}
              <img
                src={pm.thumbnail}
                alt={pm.paymentName}
                height="20"
                class="pm-logo"
              />
            {/if}
            {#if pm?.paymentName}
              <span class="pm-name">{pm.paymentName}</span>
            {:else}
              <p class="card-label" style="margin-bottom:0;">
                Scan untuk Bayar
              </p>
            {/if}
          </div>

          <div class="qr-wrapper">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data={encodeURIComponent(
                transaction.paymentDetails.qrString,
              )}&bgcolor=141414&color=f5c518&format=svg"
              alt="QR Payment"
              width="180"
              height="180"
              class="qr-img"
            />
          </div>
          <p class="qr-note">Scan dengan aplikasi e-wallet manapun</p>
          <p class="pm-amount">{formatRp(totalPrice)}</p>
        </section>

        <!-- ── Virtual Account ─────────────────────────────────────── -->
      {:else if hasVa}
        <section class="card payment-method-card">
          <!-- Header: badge + logo + nama metode bayar -->
          <div class="pm-header">
            <span class="pm-type-badge {pmBadgeClass}">{pmBadgeLabel}</span>
            {#if pm?.thumbnail}
              <img
                src={pm.thumbnail}
                alt={pm.paymentName}
                height="20"
                class="pm-logo"
              />
            {/if}
            {#if pm?.paymentName}
              <span class="pm-name">{pm.paymentName}</span>
            {:else}
              <p class="card-label" style="margin-bottom:0;">
                Nomor Pembayaran
              </p>
            {/if}
          </div>

          <div class="va-box">
            <span class="va-number">{transaction.paymentDetails.vaNumber}</span>
            <button
              class="va-copy-btn"
              onclick={copyVa}
              aria-label="Salin nomor VA"
            >
              {#if copied}
                <svg
                  class="w-icon"
                  fill="none"
                  stroke="#34d399"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              {:else}
                <svg
                  class="w-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              {/if}
            </button>
          </div>

          <div class="va-info-list">
            <div class="va-info-row">
              <span>Total Transfer</span>
              <span class="va-total">{formatRp(totalPrice)}</span>
            </div>
            <div class="va-info-row warn">
              <svg
                class="w-icon-sm flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Transfer sesuai nominal, termasuk digit terakhir</span>
            </div>
          </div>
        </section>

        <!-- ── Fallback: hanya URL ────────────────────────────────── -->
      {:else if transaction.paymentDetails?.paymentUrl}
        <section class="card payment-method-card">
          <!-- Header: badge + logo + nama metode bayar (jika ada) -->
          {#if pm}
            <div class="pm-header">
              <span class="pm-type-badge {pmBadgeClass}">{pmBadgeLabel}</span>
              {#if pm.thumbnail}
                <img
                  src={pm.thumbnail}
                  alt={pm.paymentName}
                  height="20"
                  class="pm-logo"
                />
              {/if}
              {#if pm.paymentName}
                <span class="pm-name">{pm.paymentName}</span>
              {/if}
            </div>
          {:else}
            <p class="card-label">Lanjutkan Pembayaran</p>
          {/if}
          <a
            href={transaction.paymentDetails.paymentUrl}
            target="_blank"
            rel="noopener"
            class="pay-btn-full"
          >
            Buka Halaman Pembayaran →
          </a>
        </section>
      {/if}

      <!-- Tombol aksi -->
      <div class="action-buttons">
        <button class="btn-secondary" onclick={() => window.print()}>
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Cetak Invoice
        </button>
        <a href="/" class="btn-secondary">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Kembali ke Beranda
        </a>
      </div>
    </div>
  </div>

  <!-- ── Footer ────────────────────────────────────────────────── -->
  <footer class="inv-footer">
    <p>© 2026 WTPANJAY · Terima kasih telah berbelanja!</p>
    <p class="footer-note">Butuh bantuan? Hubungi CS kami</p>
  </footer>
</div>

<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .page {
    min-height: 100vh;
    background: #0e0e0e;
    color: #cdccca;
    font-family: "Inter", system-ui, sans-serif;
    font-size: 0.875rem;
    padding: 1.5rem 1rem 3rem;
    max-width: 960px;
    margin: 0 auto;
  }

  .brand-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  .brand-logo {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 1.125rem;
    font-weight: 900;
    color: #f5c518;
    letter-spacing: 0.04em;
  }
  .brand-right {
    text-align: right;
  }
  .inv-label {
    display: block;
    font-size: 0.625rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.25);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .inv-id {
    display: block;
    font-size: 1rem;
    font-weight: 800;
    color: #fff;
    font-family: monospace;
    letter-spacing: 0.05em;
  }

  .status-banner {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1rem;
    border: 1px solid;
    border-radius: 0.875rem;
    margin-bottom: 1.5rem;
  }
  .status-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    flex-shrink: 0;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
  .status-main {
    font-size: 0.875rem;
    font-weight: 800;
  }
  .status-sub {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.35);
    margin-top: 0.125rem;
  }
  .pay-btn {
    margin-left: auto;
    flex-shrink: 0;
    padding: 0.5rem 1rem;
    background: #f5c518;
    color: #000;
    border-radius: 0.625rem;
    font-size: 0.75rem;
    font-weight: 800;
    text-decoration: none;
    transition: background 180ms;
  }
  .pay-btn:hover {
    background: #fcd534;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 680px) {
    .main-grid {
      grid-template-columns: 1fr 320px;
    }
  }
  .left-col,
  .right-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card {
    background: #141414;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 1rem;
    padding: 1rem;
  }
  .highlight-card {
    border-color: rgba(245, 197, 24, 0.2);
    background: linear-gradient(160deg, #161410 0%, #141414 100%);
  }
  .card-label {
    font-size: 0.625rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
  }

  .product-row {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }
  .product-img {
    border-radius: 0.625rem;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.04);
    flex-shrink: 0;
  }
  .product-info {
    flex: 1;
    min-width: 0;
  }
  .product-name {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #fff;
  }
  .product-desc {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 0.25rem;
  }
  .product-badges {
    display: flex;
    gap: 0.375rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }
  .product-qty .qty-label {
    font-size: 1.125rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.5);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.625rem;
    font-weight: 800;
    padding: 0.2rem 0.5rem;
    border-radius: 0.375rem;
  }
  .badge.flash {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }
  .badge.instant {
    background: rgba(245, 197, 24, 0.12);
    color: #f5c518;
  }
  .badge.sm {
    font-size: 0.5625rem;
    padding: 0.125rem 0.375rem;
    margin-right: 0.25rem;
  }

  .info-list {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    overflow: hidden;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.5625rem 0.875rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    gap: 1rem;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-key {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.75rem;
    flex-shrink: 0;
  }
  .info-val {
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    text-align: right;
    word-break: break-all;
  }
  .info-val.mono {
    font-family: monospace;
    font-size: 0.6875rem;
  }

  .price-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.875rem;
  }
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }
  .price-row.discount {
    color: #f87171;
  }
  .price-row.free span:last-child {
    color: #34d399;
  }
  .flex-row {
    display: flex;
    align-items: center;
  }
  .price-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.875rem;
    border-top: 1px solid rgba(245, 197, 24, 0.2);
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 600;
  }
  .total-amount {
    font-size: 1.375rem;
    font-weight: 900;
    color: #f5c518;
  }

  /* ── Payment method card shared ─────────────────────────────── */
  .payment-method-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pm-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
  }
  .pm-type-badge {
    font-size: 0.5625rem;
    font-weight: 800;
    padding: 0.2rem 0.5rem;
    border-radius: 0.375rem;
    flex-shrink: 0;
    letter-spacing: 0.06em;
  }
  .qris-badge {
    background: rgba(96, 165, 250, 0.15);
    color: #60a5fa;
  }
  .va-badge {
    background: rgba(167, 139, 250, 0.15);
    color: #a78bfa;
  }
  .ewallet-badge {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
  }
  .default-badge {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.4);
  }

  /* ── NEW: logo & nama metode bayar ──────────────────────────── */
  .pm-logo {
    height: 20px;
    width: auto;
    object-fit: contain;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .pm-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    flex: 1;
    min-width: 0;
    truncate: true;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── QRIS ───────────────────────────────────────────────────── */
  .qr-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.875rem;
    padding: 1rem;
  }
  .qr-img {
    border-radius: 0.5rem;
  }
  .qr-note {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.25);
    text-align: center;
  }
  .pm-amount {
    text-align: center;
    font-size: 1rem;
    font-weight: 900;
    color: #f5c518;
  }

  /* ── Virtual Account ────────────────────────────────────────── */
  .va-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(167, 139, 250, 0.06);
    border: 1px solid rgba(167, 139, 250, 0.2);
    border-radius: 0.875rem;
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }
  .va-number {
    font-family: monospace;
    font-size: 1.125rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: 0.1em;
    word-break: break-all;
  }
  .va-copy-btn {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 180ms;
  }
  .va-copy-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .va-info-list {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    overflow: hidden;
  }
  .va-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5625rem 0.875rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.35);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    gap: 0.5rem;
  }
  .va-info-row:last-child {
    border-bottom: none;
  }
  .va-info-row.warn {
    color: rgba(245, 197, 24, 0.6);
    font-size: 0.6875rem;
  }
  .va-total {
    font-size: 0.875rem;
    font-weight: 900;
    color: #f5c518;
  }

  .w-icon {
    width: 1rem;
    height: 1rem;
  }
  .w-icon-sm {
    width: 0.875rem;
    height: 0.875rem;
  }
  .flex-shrink-0 {
    flex-shrink: 0;
  }

  /* ── Fallback URL ────────────────────────────────────────────── */
  .pay-btn-full {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.875rem;
    background: #f5c518;
    color: #000;
    border-radius: 0.875rem;
    font-size: 0.875rem;
    font-weight: 800;
    text-decoration: none;
    transition: background 180ms;
  }
  .pay-btn-full:hover {
    background: #fcd534;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    text-decoration: none;
    transition: all 180ms;
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.15);
  }
  .w-4 {
    width: 1rem;
    height: 1rem;
  }

  .inv-footer {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.15);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  @media print {
    .page {
      background: #fff;
      color: #000;
      padding: 0;
    }
    .pay-btn,
    .action-buttons {
      display: none;
    }
    .card {
      border-color: #ddd;
      background: #fff;
    }
    .brand-logo {
      color: #000;
    }
    .total-amount,
    .va-total,
    .pm-amount {
      color: #000;
    }
    .va-box {
      border-color: #ddd;
      background: #f9f9f9;
    }
    .va-number {
      color: #000;
    }
    .pm-logo {
      filter: invert(1);
    }
  }
</style>
