<script lang="ts">
  import ConfirmOrderModal from "./ConfirmOrderModal.svelte";
  import type {
    Product,
    PromoApplied,
    SupportedGameConfig,
    ZoneInputMode,
  } from "./types";
  import { goto } from "$app/navigation";
  import { fmt } from "./utils";
  import type { SiteConfig } from "../../../../app";
  import { toastStore } from "$lib/components/Toast/state";

  let {
    selected = $bindable<Product | null>(null),
    canOrder,
    basePrice,
    discountAmount,
    surcharge,
    totalPrice,
    quantity,
    promoApplied,
    userId,
    serverId,
    selectedPay,
    phone,
    email = "",
    gameConfig = null,
    zoneInputMode = "text",
    gameConfigLoading = false,
    siteConfig,
    userCustomInput,
    inputs,
  }: {
    selected: Product | null;
    siteConfig: SiteConfig;
    canOrder: boolean;
    basePrice: number;
    discountAmount: number;
    surcharge?: number;
    totalPrice: number;
    quantity: number;
    promoApplied: PromoApplied | null;
    userId: string;
    serverId: string;
    selectedPay: any;
    phone: string;
    email?: string;
    gameConfig?: SupportedGameConfig | null;
    zoneInputMode?: ZoneInputMode;
    gameConfigLoading?: boolean;
    userCustomInput: any;
    inputs: any[];
  } = $props();

  let reviewData = $state<any>(null);
  let purchaseData = $state<any>(null);
  let reviewLoading = $state(false);
  let purchaseLoading = $state(false);
  let showConfirmModal = $state(false);

  const displayBasePrice = $derived(reviewData?.price ?? basePrice);
  const displayFlashDiscount = $derived(reviewData?.discount ?? 0);
  const displayDiscountLabel = $derived(reviewData?.discountLabel ?? null);
  const displayIsFlashSale = $derived(reviewData?.isFlashSale ?? false);
  const displayFee = $derived(reviewData?.fee ?? surcharge ?? 0);
  const displayTotal = $derived(reviewData?.total ?? totalPrice);
  const requiresServerInput = $derived(zoneInputMode !== "none");

  const validCustomInput = () =>
    inputs.every((input) => {
      const v = userCustomInput[input.name];
      return v !== undefined && v !== null && v !== "";
    });

  const primaryReady = $derived(() => {
    if (inputs.length && inputs.length > 0) return validCustomInput();
    return userId.trim();
  });

  const internalCanOrder = $derived(
    !!primaryReady() &&
      (!requiresServerInput || !!serverId.trim()) &&
      !!selected &&
      !!selectedPay?.id &&
      !!email.trim() &&
      !gameConfigLoading,
  );

  const orderHint = $derived(() => {
    if (gameConfigLoading) return "Cek config game...";
    if (inputs?.length > 0 && !validCustomInput()) return "Lengkapi data akun";
    if (!userId.trim() && inputs?.length == 0) return "Isi User ID";
    if (requiresServerInput && !serverId.trim())
      return zoneInputMode === "select" ? "Pilih Server" : "Isi Server ID";
    if (!selected) return "Pilih Nominal";
    if (!selectedPay?.id) return "Pilih Pembayaran";
    if (!email.trim()) return "Isi Email";
    return "Pesan Sekarang";
  });

  const progresChecklist = $derived(() => {
    const prog = [
      {
        ok: !!userId.trim() && (!requiresServerInput || !!serverId.trim()),
        label: requiresServerInput ? "Data akun + server" : "Data akun",
        icon: "user",
      },
      { ok: !!selected, label: "Nominal dipilih", icon: "box" },
      { ok: !!selectedPay?.id, label: "Metode bayar", icon: "card" },
      { ok: !!email.trim(), label: "Email", icon: "mail" },
    ];
    if (inputs?.length > 0) prog[0].ok = validCustomInput();
    return prog;
  });

  let lastReviewKey = $state("");
  let reviewRequestTimer: ReturnType<typeof setTimeout> | null = null;
  let activeReviewController: AbortController | null = null;

  $effect(() => {
    if (!selected || !selectedPay?.id) {
      reviewData = null;
      purchaseData = null;
      lastReviewKey = "";
      if (reviewRequestTimer) clearTimeout(reviewRequestTimer);
      activeReviewController?.abort();
      activeReviewController = null;
      return;
    }
    const isFlashSale = selected.productFlashId != null;
    const body: any = {
      itemId: isFlashSale ? selected.productFlashId : selected.id,
      paymentMethod: selectedPay.id,
      qty: quantity,
      phoneNumber: phone,
      flashId: isFlashSale ? selected.id : undefined,
      userData: {
        primary_id: userId,
        ...(requiresServerInput && serverId.trim()
          ? { server_id: serverId }
          : {}),
      },
      ...(promoApplied?.code ? { promoCode: promoApplied.code } : {}),
      isFlashSale,
    };
    if (inputs.length > 0) body.userData = userCustomInput;
    const reviewKey = JSON.stringify(body);
    if (reviewKey === lastReviewKey) return;
    lastReviewKey = reviewKey;
    if (reviewRequestTimer) clearTimeout(reviewRequestTimer);
    reviewRequestTimer = setTimeout(() => {
      activeReviewController?.abort();
      activeReviewController = new AbortController();
      purchaseReview(body, activeReviewController.signal);
    }, 120);
  });

  async function purchaseReview(body: any, signal?: AbortSignal) {
    reviewLoading = true;
    try {
      const res = await fetch("/api/v1/payments/purchase/review", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        signal,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg =
          errJson?.data?.message ?? errJson?.message ?? errJson?.error;
        if (errMsg) showToast(errMsg, "error");
        reviewData = null;
        purchaseData = null;
        return;
      }
      const json = await res.json();
      reviewData = json.data ?? null;
      if (reviewData?.promotion) {
        promoApplied = {
          ...promoApplied,
          code: reviewData.promotion.code,
          title: reviewData.promotion.title,
          desc:
            reviewData.promotion.discType === "percent"
              ? `Potongan ${reviewData.promotion.value}%`
              : `Potongan Rp ${Number(reviewData.promotion.value).toLocaleString("id-ID")}`,
          discount: reviewData.promotion.discount,
          previewDiscount: reviewData.promotion.discount,
        };
      }
      purchaseData = body;
    } catch (err: any) {
      if (err.name !== "AbortError")
        console.error("Purchase review error:", err);
    } finally {
      reviewLoading = false;
    }
  }

  type ToastType = "error" | "success" | "info";
  function showToast(message: string, type: ToastType = "error") {
    toastStore.show(message, type, 3000);
  }

  const purchaseItem = async () => {
    if (!purchaseData) {
      showToast("Data pesanan belum siap, tunggu sebentar.", "info");
      return;
    }
    purchaseLoading = true;
    try {
      const res = await fetch("/api/v1/payments/purchase", {
        method: "POST",
        body: JSON.stringify({
          ...purchaseData,
          email: email.trim(),
          ...(promoApplied?.code ? { promoCode: promoApplied.code } : {}),
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg =
          errJson?.data?.message ??
          errJson?.Message ??
          errJson?.message ??
          errJson?.error ??
          `Terjadi kesalahan (${res.status})`;
        showConfirmModal = false;
        purchaseLoading = false;
        setTimeout(() => showToast(errMsg, "error"), 150);
        return;
      }
      const json = await res.json();
      const trxId = json?.data?.trxId ?? json?.trxId;
      if (!trxId) {
        showConfirmModal = false;
        purchaseLoading = false;
        setTimeout(
          () =>
            showToast(
              "Transaksi dibuat tapi ID tidak ditemukan, cek riwayat order.",
              "info",
            ),
          150,
        );
        return;
      }
      showConfirmModal = false;
      await goto(`/invoice/${trxId}`);
    } catch (err: any) {
      showConfirmModal = false;
      purchaseLoading = false;
      setTimeout(
        () => showToast("Gagal terhubung ke server, coba lagi.", "error"),
        150,
      );
    }
  };

  /* total saving convenience */
  const totalSaving = $derived(
    (displayIsFlashSale ? displayFlashDiscount : 0) + (discountAmount ?? 0),
  );
</script>

<!-- ── Modal ── -->
<ConfirmOrderModal
  bind:open={showConfirmModal}
  loading={purchaseLoading}
  customMode={inputs && inputs.length > 0}
  {inputs}
  {selected}
  {userId}
  {serverId}
  {phone}
  {gameConfig}
  {zoneInputMode}
  {email}
  {selectedPay}
  {reviewData}
  {displayBasePrice}
  {displayFlashDiscount}
  {displayDiscountLabel}
  {displayIsFlashSale}
  {displayFee}
  {displayTotal}
  {quantity}
  {discountAmount}
  {promoApplied}
  onConfirm={purchaseItem}
  onCancel={() => (showConfirmModal = false)}
/>

<!-- ════════════════════════════════════════
     RATING CARD
═══════════════════════════════════════ -->
<div class="glass-card rating-card">
  <div class="rating-glow" aria-hidden="true"></div>

  <div class="rating-inner">
    <div class="rating-left">
      <p class="section-eyebrow">Ulasan Pengguna</p>
      <div class="rating-score-row">
        <span class="rating-score">4.99</span>
        <div class="rating-stars" aria-label="Rating 5 dari 5 bintang">
          {#each Array(5) as _}
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          {/each}
        </div>
      </div>
      <p class="rating-sub">
        Dari <strong>20.85 jt</strong> penilaian pengguna
      </p>
    </div>

    <!-- Mini bar chart -->
    <div class="rating-bars" aria-hidden="true">
      {#each [["5★", 92], ["4★", 5], ["3★", 2], ["2★", 0.5], ["1★", 0.5]] as [label, pct]}
        <div class="rbar-row">
          <span class="rbar-label">{label}</span>
          <div class="rbar-track">
            <div class="rbar-fill" style="width:{pct}%"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     HELP / CS CARD
═══════════════════════════════════════ -->
<div class="glass-card help-card">
  <div class="help-icon-wrap" aria-hidden="true">
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="18"
      height="18"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  </div>
  <div class="help-text">
    <p class="help-title">Butuh Bantuan?</p>
    <p class="help-sub">Tim support kami siap membantu 24/7</p>
  </div>
  <button
    type="button"
    class="help-btn"
    onclick={() => window.open(siteConfig.supportWhatsapp ?? "", "_blank")}
    aria-label="Hubungi admin via WhatsApp"
  >
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      width="13"
      height="13"
      aria-hidden="true"
    >
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"
      />
    </svg>
    <span>Chat Sekarang</span>
  </button>
</div>

<!-- ════════════════════════════════════════
     ORDER SUMMARY
═══════════════════════════════════════ -->
<div class="summary-card" class:summary-card-active={!!selected}>
  <!-- Ambient glow saat item dipilih -->
  {#if selected}
    <div class="summary-glow" aria-hidden="true"></div>
  {/if}

  <div class="summary-header">
    <div class="section-eyebrow-row">
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="11"
        height="11"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p class="section-eyebrow">Ringkasan Pesanan</p>
    </div>

    <!-- Saving badge -->
    {#if selected && totalSaving > 0 && !reviewLoading}
      <div class="saving-badge" aria-label="Total penghematan">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="10"
          height="10"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M5 13l4 4L19 7"
          />
        </svg>
        Hemat {fmt(totalSaving)}
      </div>
    {/if}
  </div>

  {#if !selected}
    <!-- Empty state -->
    <div class="summary-empty">
      <div class="empty-icon-wrap" aria-hidden="true">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="22"
          height="22"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <p class="empty-title">Keranjang kosong</p>
      <p class="empty-sub">Pilih nominal di daftar produk</p>
    </div>
  {:else}
    <!-- Selected item pill -->
    <div class="selected-pill">
      {#if selected.icon}
        <img
          src={selected.icon}
          alt=""
          width="28"
          height="28"
          class="selected-pill-img"
          loading="lazy"
          aria-hidden="true"
        />
      {/if}
      <div class="selected-pill-info">
        <p class="selected-pill-label">{selected.label}</p>
        {#if selected.sublabel}
          <p class="selected-pill-sub">{selected.sublabel}</p>
        {/if}
      </div>
      <button
        type="button"
        class="selected-pill-remove"
        onclick={() => (selected = null)}
        aria-label="Hapus pilihan {selected.label}"
      >
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="11"
          height="11"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Price breakdown -->
    <div class="price-rows">
      <div class="price-row">
        <span class="price-row-label">Harga satuan</span>
        {#if reviewLoading}
          <div class="skel skel-md" aria-hidden="true"></div>
        {:else}
          <span class="price-row-val">{fmt(displayBasePrice)}</span>
        {/if}
      </div>

      {#if quantity > 1}
        <div class="price-row">
          <span class="price-row-label">Jumlah</span>
          <span class="price-row-val">×{quantity}</span>
        </div>
      {/if}

      {#if displayIsFlashSale && displayFlashDiscount > 0}
        <div class="price-row price-row-discount">
          <span class="price-row-label flex items-center gap-1.5">
            <span class="flash-badge" aria-label="Flash Sale">
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                width="9"
                height="9"
                aria-hidden="true"
              >
                <path
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                />
              </svg>
              FLASH
            </span>
            {displayDiscountLabel ?? "Diskon Flash Sale"}
          </span>
          {#if reviewLoading}
            <div class="skel skel-sm" aria-hidden="true"></div>
          {:else}
            <span class="price-row-discount-val"
              >−{fmt(displayFlashDiscount)}</span
            >
          {/if}
        </div>
      {/if}

      {#if discountAmount > 0}
        <div class="price-row price-row-promo">
          <span class="price-row-label">
            Promo
            <span class="promo-code-tag">{promoApplied?.code}</span>
          </span>
          <span class="price-row-promo-val">−{fmt(discountAmount)}</span>
        </div>
      {/if}

      <div class="price-row">
        <span class="price-row-label">Biaya layanan</span>
        {#if reviewLoading}
          <div class="skel skel-sm" aria-hidden="true"></div>
        {:else if displayFee > 0}
          <span class="price-row-val price-row-fee">+{fmt(displayFee)}</span>
        {:else}
          <span class="price-row-free">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="10"
              height="10"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Gratis
          </span>
        {/if}
      </div>
    </div>

    <!-- Total row -->
    <div class="total-row">
      <div>
        <span class="total-label">Total Pembayaran</span>
        {#if selectedPay?.logo}
          <div class="total-pay-meta">
            <img
              src={selectedPay.logo}
              alt={selectedPay.name ?? "Payment"}
              height="14"
              loading="lazy"
              aria-hidden="true"
            />
          </div>
        {/if}
      </div>
      {#if reviewLoading}
        <div class="skel skel-lg" aria-hidden="true"></div>
      {:else}
        <span class="total-amount">{fmt(displayTotal)}</span>
      {/if}
    </div>

    <!-- Desktop CTA -->
    <div class="desktop-cta hidden md:block">
      <button
        type="button"
        class="cta-btn"
        class:cta-btn-ready={internalCanOrder && !reviewLoading}
        class:cta-btn-disabled={!internalCanOrder || reviewLoading}
        disabled={!internalCanOrder || reviewLoading}
        onclick={() => {
          if (internalCanOrder && !reviewLoading) showConfirmModal = true;
        }}
        aria-label={internalCanOrder ? "Pesan sekarang" : orderHint()}
      >
        {#if internalCanOrder && !reviewLoading}
          <div class="cta-shine" aria-hidden="true"></div>
        {/if}
        {#if reviewLoading}
          <svg
            class="cta-spinner"
            viewBox="0 0 24 24"
            fill="none"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="rgba(0,0,0,0.2)"
              stroke-width="2.5"
            />
            <path
              d="M12 3a9 9 0 019 9"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
          Menghitung harga...
        {:else}
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {internalCanOrder ? "Pesan Sekarang" : orderHint()}
        {/if}
      </button>

      <!-- Progress checklist -->
      <div class="checklist" role="list" aria-label="Kelengkapan pesanan">
        {#each progresChecklist() as item}
          <div class="checklist-item" role="listitem">
            <div
              class="checklist-dot"
              class:checklist-dot-done={item.ok}
              aria-hidden="true"
            >
              {#if item.ok}
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="8"
                  height="8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              {/if}
            </div>
            <span class="checklist-label" class:checklist-label-done={item.ok}>
              {item.label}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- ════════════════════════════════════════
     TRUST / PAYMENT METHODS BAR
═══════════════════════════════════════ -->
<div class="trust-bar" role="list" aria-label="Metode pembayaran tersedia">
  {#each [{ icon: "💳", label: "Transfer" }, { icon: "📱", label: "QRIS" }, { icon: "🏧", label: "VA Bank" }, { icon: "👛", label: "E-Wallet" }] as m}
    <div class="trust-item" role="listitem">
      <span class="trust-icon" aria-hidden="true">{m.icon}</span>
      <span class="trust-label">{m.label}</span>
    </div>
  {/each}
</div>

<!-- ════════════════════════════════════════
     MOBILE FIXED BOTTOM BAR
═══════════════════════════════════════ -->
{#if selected}
  <div class="mob-bar md:hidden" role="complementary" aria-label="Order bar">
    <!-- Saving strip -->
    {#if totalSaving > 0 && !reviewLoading}
      <div class="mob-saving-strip">
        {#if displayIsFlashSale && displayFlashDiscount > 0}
          <span class="mob-save-badge mob-save-flash">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              width="9"
              height="9"
              aria-hidden="true"
            >
              <path
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              />
            </svg>
            FLASH
          </span>
          <span class="mob-save-val mob-save-flash-val"
            >−{fmt(displayFlashDiscount)}</span
          >
        {/if}
        {#if discountAmount > 0}
          {#if displayIsFlashSale && displayFlashDiscount > 0}
            <span class="mob-save-sep">+</span>
          {/if}
          <span class="mob-save-badge mob-save-promo">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              width="9"
              height="9"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            {promoApplied?.code ?? "PROMO"}
          </span>
          <span class="mob-save-val mob-save-promo-val"
            >−{fmt(discountAmount)}</span
          >
        {/if}
        {#if displayIsFlashSale && displayFlashDiscount > 0 && discountAmount > 0}
          <span class="mob-save-sep">·</span>
          <span class="mob-save-total">Hemat {fmt(totalSaving)}</span>
        {/if}
      </div>
    {/if}

    <!-- Top glow line -->
    <div class="mob-bar-glow" aria-hidden="true"></div>

    <div class="mob-bar-inner">
      <div class="mob-bar-info">
        {#if reviewLoading}
          <div class="skel skel-price" aria-hidden="true"></div>
          <div class="skel skel-sub" aria-hidden="true"></div>
        {:else}
          <span class="mob-price">{fmt(displayTotal)}</span>
          <div class="mob-meta">
            <span class="mob-meta-label">{selected.label}</span>
            {#if selectedPay?.logo}
              <img
                src={selectedPay.logo}
                alt={selectedPay.name ?? ""}
                height="14"
                loading="lazy"
                class="mob-pay-logo"
                aria-hidden="true"
              />
            {/if}
          </div>
        {/if}
      </div>

      <button
        type="button"
        class="mob-cta-btn"
        class:mob-cta-ready={internalCanOrder && !reviewLoading}
        class:mob-cta-disabled={!internalCanOrder || reviewLoading}
        disabled={!internalCanOrder || reviewLoading}
        onclick={() => {
          if (internalCanOrder && !reviewLoading) showConfirmModal = true;
        }}
        aria-label={internalCanOrder ? "Pesan sekarang" : orderHint()}
      >
        {#if internalCanOrder && !reviewLoading}
          <div class="mob-cta-shine" aria-hidden="true"></div>
        {/if}
        {#if reviewLoading}
          <svg
            class="mob-spinner"
            viewBox="0 0 24 24"
            fill="none"
            width="15"
            height="15"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="rgba(0,0,0,0.2)"
              stroke-width="2.5"
            />
            <path
              d="M12 3a9 9 0 019 9"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
          Memuat...
        {:else}
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {internalCanOrder ? "Pesan Sekarang" : orderHint()}
        {/if}
      </button>
    </div>
  </div>
{/if}

<style>
  /* ── Shared glass base ── */
  .glass-card {
    position: relative;
    border-radius: 1.125rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #0f0f0f;
    overflow: hidden;
  }
  .section-eyebrow {
    font-size: 0.5625rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
  .section-eyebrow-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  /* ═══════════════════════════
     RATING CARD
  ═══════════════════════════ */
  .rating-card {
    padding: 1.125rem 1.25rem;
  }
  .rating-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse at top right,
      rgba(245, 197, 24, 0.06),
      transparent 65%
    );
  }
  .rating-inner {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }
  .rating-left {
    flex: 1;
  }
  .rating-score-row {
    display: flex;
    align-items: flex-end;
    gap: 0.625rem;
    margin: 0.375rem 0 0.25rem;
  }
  .rating-score {
    font-size: 2.5rem;
    font-weight: 900;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.04em;
  }
  .rating-stars {
    display: flex;
    gap: 0.125rem;
    padding-bottom: 0.25rem;
    color: var(--color-primary);
    filter: drop-shadow(0 0 4px rgba(245, 197, 24, 0.5));
  }
  .rating-sub {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 500;
  }
  .rating-sub strong {
    color: rgba(255, 255, 255, 0.55);
    font-weight: 700;
  }

  .rating-bars {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    justify-content: center;
    padding-top: 0.25rem;
    min-width: 6rem;
  }
  .rbar-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .rbar-label {
    font-size: 0.5rem;
    color: rgba(255, 255, 255, 0.25);
    font-weight: 700;
    width: 1.5rem;
    text-align: right;
    flex-shrink: 0;
  }
  .rbar-track {
    flex: 1;
    height: 3px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 9999px;
    overflow: hidden;
  }
  .rbar-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--color-primary),
      rgba(245, 197, 24, 0.6)
    );
    border-radius: 9999px;
  }

  /* ═══════════════════════════
     HELP CARD
  ═══════════════════════════ */
  .help-card {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1.125rem;
  }
  .help-icon-wrap {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    border-radius: 0.75rem;
    background: rgba(245, 197, 24, 0.08);
    border: 1px solid rgba(245, 197, 24, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
  }
  .help-text {
    flex: 1;
    min-width: 0;
  }
  .help-title {
    font-size: 0.8125rem;
    font-weight: 800;
    color: #fff;
  }
  .help-sub {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 0.1rem;
  }
  .help-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    font-size: 0.6875rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
  }
  .help-btn:hover {
    border-color: rgba(245, 197, 24, 0.4);
    background: rgba(245, 197, 24, 0.07);
    color: var(--color-primary);
    box-shadow: 0 0 12px rgba(245, 197, 24, 0.12);
  }

  /* ═══════════════════════════
     ORDER SUMMARY CARD
  ═══════════════════════════ */
  .summary-card {
    position: relative;
    border-radius: 1.125rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #0f0f0f;
    overflow: hidden;
    transition: border-color 0.3s ease;
  }
  .summary-card-active {
    border-color: rgba(245, 197, 24, 0.22);
  }
  .summary-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse at 50% 0%,
      rgba(245, 197, 24, 0.05),
      transparent 65%
    );
  }

  .summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    gap: 0.5rem;
  }
  .saving-badge {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.2);
    font-size: 0.5625rem;
    font-weight: 800;
    color: #34d399;
    letter-spacing: 0.03em;
    animation: badge-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes badge-in {
    from {
      transform: scale(0.7);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Empty state */
  .summary-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem 1rem;
    gap: 0.5rem;
  }
  .empty-icon-wrap {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 0.25rem;
  }
  .empty-title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.35);
  }
  .empty-sub {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.2);
  }

  /* Selected item pill */
  .selected-pill {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.875rem 1.25rem 0;
    padding: 0.75rem 0.875rem;
    border-radius: 0.875rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
  }
  .selected-pill-img {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
    flex-shrink: 0;
  }
  .selected-pill-info {
    flex: 1;
    min-width: 0;
  }
  .selected-pill-label {
    font-size: 0.8125rem;
    font-weight: 800;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .selected-pill-sub {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.35);
    margin-top: 0.1rem;
  }
  .selected-pill-remove {
    width: 1.625rem;
    height: 1.625rem;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.35);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .selected-pill-remove:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #f87171;
  }

  /* Price rows */
  .price-rows {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0.75rem 1.25rem;
    padding: 0.625rem 0.875rem;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.875rem;
  }
  .price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .price-row:last-child {
    border-bottom: none;
  }
  .price-row-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .price-row-val {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .price-row-fee {
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
  }
  .price-row-discount-val {
    font-size: 0.75rem;
    color: #f87171;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .price-row-promo-val {
    font-size: 0.75rem;
    color: #34d399;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .price-row-free {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: #34d399;
    font-weight: 800;
  }

  .flash-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.15rem 0.4rem;
    border-radius: 0.3rem;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #f87171;
    font-size: 0.5rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .promo-code-tag {
    display: inline-flex;
    padding: 0.1rem 0.35rem;
    border-radius: 0.3rem;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.2);
    color: #34d399;
    font-size: 0.5625rem;
    font-weight: 900;
    letter-spacing: 0.06em;
  }

  /* Total row */
  .total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 1.25rem 0;
    padding: 0.875rem 0.875rem;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    gap: 0.5rem;
  }
  .total-label {
    display: block;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 600;
  }
  .total-pay-meta {
    display: flex;
    align-items: center;
    margin-top: 0.3rem;
  }
  .total-pay-meta img {
    height: 0.875rem;
    object-fit: contain;
    opacity: 0.6;
  }
  .total-amount {
    font-size: 1.375rem;
    font-weight: 900;
    color: var(--color-primary);
    letter-spacing: -0.03em;
    text-shadow: 0 0 20px rgba(245, 197, 24, 0.35);
    font-variant-numeric: tabular-nums;
  }

  /* Desktop CTA */
  .desktop-cta {
    padding: 0 1rem 1rem;
  }
  .cta-btn {
    position: relative;
    overflow: hidden;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.9rem 1.5rem;
    border-radius: 0.9rem;
    border: none;
    font-size: 0.9375rem;
    font-weight: 900;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cta-btn-ready {
    background: var(--color-primary);
    color: #000;
    box-shadow:
      0 0 0 1px rgba(245, 197, 24, 0.25),
      0 4px 20px rgba(245, 197, 24, 0.35),
      0 0 50px rgba(245, 197, 24, 0.1);
  }
  .cta-btn-ready:hover {
    transform: translateY(-1px);
    box-shadow:
      0 0 0 1px rgba(245, 197, 24, 0.35),
      0 8px 28px rgba(245, 197, 24, 0.45),
      0 0 60px rgba(245, 197, 24, 0.15);
  }
  .cta-btn-ready:active {
    transform: translateY(0) scale(0.98);
  }
  .cta-btn-disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.07);
    cursor: not-allowed;
    box-shadow: none;
  }
  .cta-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 35%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 65%
    );
    animation: shine 2.5s ease infinite;
    pointer-events: none;
  }
  .cta-spinner {
    animation: spin 0.75s linear infinite;
  }

  /* Checklist */
  .checklist {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-top: 0.875rem;
  }
  .checklist-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .checklist-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }
  .checklist-dot-done {
    background: var(--color-primary);
    border-color: transparent;
    box-shadow: 0 0 8px rgba(245, 197, 24, 0.4);
    color: #000;
  }
  .checklist-label {
    font-size: 0.625rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.2);
    transition: color 0.2s ease;
  }
  .checklist-label-done {
    color: rgba(255, 255, 255, 0.5);
  }

  /* ═══════════════════════════
     TRUST BAR
  ═══════════════════════════ */
  .trust-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.125rem 1rem;
    padding: 0.375rem 0;
  }
  .trust-item {
    display: flex;
    align-items: center;
    gap: 0.325rem;
  }
  .trust-icon {
    font-size: 0.75rem;
    opacity: 0.4;
  }
  .trust-label {
    font-size: 0.5625rem;
    color: rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }

  /* ═══════════════════════════
     SKELETON
  ═══════════════════════════ */
  .skel {
    border-radius: 0.4rem;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.09) 50%,
      rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
  }
  .skel-sm {
    height: 0.875rem;
    width: 4rem;
  }
  .skel-md {
    height: 0.875rem;
    width: 5.5rem;
  }
  .skel-lg {
    height: 1.5rem;
    width: 7rem;
    border-radius: 0.5rem;
  }
  .skel-price {
    height: 1.375rem;
    width: 6rem;
    border-radius: 0.5rem;
  }
  .skel-sub {
    height: 0.75rem;
    width: 8rem;
    margin-top: 0.25rem;
  }

  /* ═══════════════════════════
     MOBILE BAR
  ═══════════════════════════ */
  .mob-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9998;
    background: linear-gradient(
      180deg,
      rgba(8, 8, 8, 0.7) 0%,
      rgba(6, 6, 6, 0.96) 100%
    );
    backdrop-filter: blur(28px) saturate(200%);
    -webkit-backdrop-filter: blur(28px) saturate(200%);
    padding: 0 1rem calc(0.875rem + env(safe-area-inset-bottom));
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  .mob-bar-glow {
    position: absolute;
    top: -1px;
    left: 8%;
    right: 8%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(245, 197, 24, 0.5) 30%,
      rgba(245, 197, 24, 0.85) 50%,
      rgba(245, 197, 24, 0.5) 70%,
      transparent
    );
    filter: blur(0.5px);
  }
  .mob-bar::before {
    content: "";
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 3rem;
    pointer-events: none;
    background: radial-gradient(
      ellipse at 50% 0%,
      rgba(245, 197, 24, 0.07),
      transparent 75%
    );
  }

  /* Saving strip */
  .mob-saving-strip {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.3rem;
    padding: 0.625rem 0 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .mob-save-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.2rem 0.45rem;
    border-radius: 9999px;
    font-size: 0.5rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .mob-save-flash {
    background: rgba(239, 68, 68, 0.14);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #f87171;
  }
  .mob-save-promo {
    background: rgba(52, 211, 153, 0.12);
    border: 1px solid rgba(52, 211, 153, 0.22);
    color: #6ee7b7;
  }
  .mob-save-val {
    font-size: 0.6875rem;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
  }
  .mob-save-flash-val {
    color: #f87171;
  }
  .mob-save-promo-val {
    color: #34d399;
  }
  .mob-save-sep {
    font-size: 0.5625rem;
    color: rgba(255, 255, 255, 0.2);
  }
  .mob-save-total {
    font-size: 0.5625rem;
    font-weight: 800;
    color: rgba(245, 197, 24, 0.65);
  }

  /* Bar inner */
  .mob-bar-inner {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    position: relative;
    padding-top: 0.75rem;
  }
  .mob-bar-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .mob-price {
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--color-primary);
    letter-spacing: -0.03em;
    line-height: 1;
    text-shadow: 0 0 18px rgba(245, 197, 24, 0.4);
    font-variant-numeric: tabular-nums;
  }
  .mob-meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.2rem;
    flex-wrap: wrap;
  }
  .mob-meta-label {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 500;
  }
  .mob-pay-logo {
    height: 0.875rem;
    object-fit: contain;
    opacity: 0.5;
  }

  /* Mobile CTA */
  .mob-cta-btn {
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.8125rem 1.375rem;
    border-radius: 0.9rem;
    border: none;
    font-size: 0.9375rem;
    font-weight: 900;
    letter-spacing: 0.01em;
    white-space: nowrap;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
  }
  .mob-cta-ready {
    background: var(--color-primary);
    color: #000;
    box-shadow:
      0 0 0 1px rgba(245, 197, 24, 0.2),
      0 4px 20px rgba(245, 197, 24, 0.35),
      0 0 40px rgba(245, 197, 24, 0.12);
  }
  .mob-cta-ready:active {
    transform: scale(0.95);
    box-shadow: 0 2px 10px rgba(245, 197, 24, 0.3);
  }
  .mob-cta-disabled {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.07);
    cursor: not-allowed;
  }
  .mob-cta-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 35%,
      rgba(255, 255, 255, 0.35) 50%,
      transparent 65%
    );
    animation: shine 2.5s ease infinite;
    pointer-events: none;
  }
  .mob-spinner {
    animation: spin 0.75s linear infinite;
  }

  /* ═══════════════════════════
     KEYFRAMES
  ═══════════════════════════ */
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    60% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
