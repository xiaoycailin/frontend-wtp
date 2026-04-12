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
  import { teleport } from "$lib/utils";
  import { getContext } from "svelte";

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
  }: {
    selected: Product | null;
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

  // ── canOrder internal — wajib: userId, nominal, metode bayar, email ──
  const internalCanOrder = $derived(
    !!userId.trim() &&
      (!requiresServerInput || !!serverId.trim()) &&
      !!selected &&
      !!selectedPay?.id &&
      !!email.trim() &&
      !gameConfigLoading,
  );

  // hint teks tombol — urutan prioritas dari yang paling awal harus diisi
  const orderHint = $derived(() => {
    if (gameConfigLoading) return "Cek config game...";
    if (!userId.trim()) return "Isi User ID dulu";
    if (requiresServerInput && !serverId.trim())
      return zoneInputMode === "select"
        ? "Pilih Server dulu"
        : "Isi Server ID dulu";
    if (!selected) return "Pilih Nominal dulu";
    if (!selectedPay?.id) return "Pilih Pembayaran dulu";
    if (!email.trim()) return "Isi Email dulu";
    return "Pesan Sekarang!";
  });

  // checklist — 4 item wajib (phone opsional, tidak masuk checklist)
  const progresChecklist = $derived(() => [
    {
      ok: !!userId.trim() && (!requiresServerInput || !!serverId.trim()),
      label: requiresServerInput ? "Data akun + server" : "Data akun",
    },
    { ok: !!selected, label: "Nominal dipilih" },
    { ok: !!selectedPay?.id, label: "Metode bayar" },
    { ok: !!email.trim(), label: "Email" },
  ]);

  $effect(() => {
    if (!selected || !selectedPay?.id) {
      reviewData = null;
      return;
    }

    const isFlashSale = selected.productFlashId != null;
    const body = {
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
      isFlashSale,
    };

    const controller = new AbortController();
    purchaseReview(body, controller.signal);
    return () => controller.abort();
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
          errJson?.data?.message ??
          errJson?.message ??
          errJson?.Message ??
          errJson?.error;
        if (errMsg) showToast(errMsg, "error");
        reviewData = null;
        purchaseData = null;
        return;
      }

      const json = await res.json();
      reviewData = json.data ?? null;
      purchaseData = body;
    } catch (err: any) {
      if (err.name !== "AbortError")
        console.error("Purchase review error:", err);
    } finally {
      reviewLoading = false;
    }
  }

  // ── Toast ──
  type ToastType = "error" | "success" | "info";
  let toast = $state<{ message: string; type: ToastType } | null>(null);
  let toastTimer: ReturnType<typeof setTimeout>;

  function showToast(message: string, type: ToastType = "error") {
    clearTimeout(toastTimer);
    toast = { message, type };
    toastTimer = setTimeout(() => (toast = null), 4000);
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
        body: JSON.stringify({ ...purchaseData, email: email.trim() }),
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
      console.error("Purchase error:", err);
    }
  };

  // const siteConfig: any = getContext("site_config");
  // console.log(siteConfig);
</script>

<!-- Modal konfirmasi -->
<ConfirmOrderModal
  bind:open={showConfirmModal}
  loading={purchaseLoading}
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

<!-- Toast -->
{#if toast}
  <div
    use:teleport
    class="toast"
    class:toast-error={toast.type === "error"}
    class:toast-success={toast.type === "success"}
    class:toast-info={toast.type === "info"}
    role="alert"
    aria-live="assertive"
  >
    {#if toast.type === "error"}
      <svg
        class="toast-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
    {:else if toast.type === "success"}
      <svg
        class="toast-icon"
        fill="none"
        stroke="currentColor"
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
        class="toast-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    {/if}
    <span class="toast-msg">{toast.message}</span>
    <button
      class="toast-close"
      onclick={() => (toast = null)}
      aria-label="Tutup"
    >
      <svg
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
{/if}

<!-- Rating -->
<div
  class="relative rounded-2xl overflow-hidden border border-white/[0.07] bg-[#111111] p-5"
>
  <div
    class="absolute inset-0 pointer-events-none"
    style="background:radial-gradient(ellipse at top right,rgba(245,197,24,0.05),transparent 60%);"
  ></div>
  <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
    Ulasan & Rating
  </p>
  <div class="flex items-end gap-3 mb-1">
    <span class="text-4xl font-black text-white">4.99</span>
    <div class="flex gap-0.5 pb-1.5">
      {#each Array(5) as _}
        <svg
          class="w-5 h-5 text-[var(--color-primary)]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      {/each}
    </div>
  </div>
  <p class="text-[11px] text-white/35">
    Berdasarkan total <span class="text-white/60 font-bold">20.85 jt</span> rating
  </p>
</div>

<!-- Help -->
<div
  class="rounded-2xl border border-white/[0.07] bg-[#111111] p-4 flex items-center gap-3"
>
  <div
    class="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0"
  >
    <span class="text-lg">🎧</span>
  </div>
  <div>
    <p class="text-xs font-bold text-white">Butuh Bantuan?</p>
    <p class="text-[11px] text-white/40">Hubungi admin kami sekarang.</p>
  </div>
  <button
    // onclick={}
    class="ml-auto flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold
           bg-white/5 border border-white/10 text-white/60
           hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] transition-all duration-200"
  >
    Chat
  </button>
</div>

<!-- Order Summary -->
<div
  class="relative rounded-2xl overflow-hidden border bg-[#111111] transition-all duration-300"
  style="border-color:{selected
    ? 'rgba(245,197,24,0.3)'
    : 'rgba(255,255,255,0.07)'};"
>
  {#if selected}
    <div
      class="absolute inset-0 pointer-events-none"
      style="background:radial-gradient(ellipse at top,rgba(245,197,24,0.04),transparent 60%);"
    ></div>
  {/if}

  <div class="p-5">
    <p
      class="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3"
    >
      Ringkasan Pesanan
    </p>

    {#if !selected}
      <div class="flex flex-col items-center py-6 text-center">
        <div
          class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-2xl"
        >
          🧺
        </div>
        <p class="text-xs text-white/30 font-medium">
          Belum ada item yang dipilih
        </p>
        <p class="text-[10px] text-white/20 mt-1">
          Pilih nominal di sebelah kiri
        </p>
      </div>
    {:else}
      <!-- Selected item -->
      <div
        class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-3"
      >
        <img src={selected.icon} width="25" alt="" />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-white truncate">{selected.label}</p>
          {#if selected.sublabel}
            <p class="text-[10px] text-white/40">{selected.sublabel}</p>
          {/if}
        </div>
        <button
          onclick={() => (selected = null)}
          class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center
                 hover:bg-red-500/30 text-white/40 hover:text-red-400 transition-all"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Price breakdown -->
      <div class="space-y-2 mb-3 text-xs">
        <div class="flex justify-between">
          <span class="text-white/40">Harga satuan</span>
          {#if reviewLoading}
            <div class="h-3.5 w-20 rounded bg-white/10 animate-pulse"></div>
          {:else}
            <span class="text-white font-medium">{fmt(displayBasePrice)}</span>
          {/if}
        </div>

        {#if quantity > 1}
          <div class="flex justify-between">
            <span class="text-white/40">Jumlah</span>
            <span class="text-white font-medium">×{quantity}</span>
          </div>
        {/if}

        {#if displayIsFlashSale && displayFlashDiscount > 0}
          <div class="flex justify-between">
            <span class="text-white/40 flex items-center gap-1">
              <span
                class="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-red-500/20 text-red-400"
              >
                ⚡ FLASH
              </span>
              {displayDiscountLabel ?? "Diskon Flash Sale"}
            </span>
            {#if reviewLoading}
              <div class="h-3.5 w-16 rounded bg-white/10 animate-pulse"></div>
            {:else}
              <span class="text-red-400 font-bold"
                >-{fmt(displayFlashDiscount)}</span
              >
            {/if}
          </div>
        {/if}

        {#if discountAmount > 0}
          <div class="flex justify-between">
            <span class="text-white/40">Diskon ({promoApplied?.code})</span>
            <span class="text-emerald-400 font-bold"
              >-{fmt(discountAmount)}</span
            >
          </div>
        {/if}

        {#if displayFee > 0}
          <div class="flex justify-between">
            <span class="text-white/40">Biaya Admin</span>
            {#if reviewLoading}
              <div class="h-3.5 w-16 rounded bg-white/10 animate-pulse"></div>
            {:else}
              <span class="text-white/60 font-medium">+{fmt(displayFee)}</span>
            {/if}
          </div>
        {:else}
          <div class="flex justify-between">
            <span class="text-white/40">Biaya Layanan</span>
            <span class="text-emerald-400 font-medium">Gratis</span>
          </div>
        {/if}
      </div>

      <div
        class="border-t border-white/[0.06] pt-3 flex items-center justify-between"
      >
        <span class="text-xs text-white/50 font-medium">Total</span>
        {#if reviewLoading}
          <div class="h-6 w-28 rounded bg-white/10 animate-pulse"></div>
        {:else}
          <span class="text-lg font-black text-[var(--color-primary)]"
            >{fmt(displayTotal)}</span
          >
        {/if}
      </div>
    {/if}
  </div>

  <!-- CTA desktop -->
  <div class="hidden md:block px-4 pb-4">
    <button
      disabled={!internalCanOrder || reviewLoading}
      class="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
             text-sm font-black tracking-wide transition-all duration-300 overflow-hidden"
      style="
        background: {internalCanOrder && !reviewLoading
        ? 'var(--color-primary)'
        : 'rgba(255,255,255,0.05)'};
        color:      {internalCanOrder && !reviewLoading
        ? '#000'
        : 'rgba(255,255,255,0.2)'};
        box-shadow: {internalCanOrder && !reviewLoading
        ? '0 0 25px rgba(245,197,24,0.4),0 4px 15px rgba(245,197,24,0.2)'
        : 'none'};
        cursor:     {internalCanOrder && !reviewLoading
        ? 'pointer'
        : 'not-allowed'};
      "
      onclick={() => {
        if (internalCanOrder && !reviewLoading) showConfirmModal = true;
      }}
    >
      {#if internalCanOrder && !reviewLoading}
        <div
          class="absolute inset-0 opacity-30"
          style="background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.5) 50%,transparent 60%);
                 animation:shine 2.5s infinite;"
        ></div>
      {/if}
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {internalCanOrder ? "Pesan Sekarang!" : orderHint()}
    </button>

    <!-- Progress checklist -->
    <div class="mt-3 space-y-1">
      {#each progresChecklist() as item}
        <div class="flex items-center gap-2">
          <div
            class="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
            style="background:{item.ok
              ? 'var(--color-primary)'
              : 'rgba(255,255,255,0.08)'};"
          >
            {#if item.ok}
              <svg
                class="w-2 h-2 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
          <span
            class="text-[10px]"
            style="color:{item.ok
              ? 'rgba(255,255,255,0.5)'
              : 'rgba(255,255,255,0.2)'};"
          >
            {item.label}
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- Mobile Fixed Bottom Bar -->
{#if selected}
  <div class="mobile-order-bar md:hidden">
    {#if (displayIsFlashSale && displayFlashDiscount > 0) || discountAmount > 0}
      <div class="discount-strip">
        <div class="discount-strip-inner">
          {#if displayIsFlashSale && displayFlashDiscount > 0}
            <span class="ds-flash-badge">
              <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                />
              </svg>
              FLASH SALE
            </span>
            <span class="ds-text">Hemat</span>
            <span class="ds-amount ds-flash">{fmt(displayFlashDiscount)}</span>
          {/if}

          {#if discountAmount > 0}
            {#if displayIsFlashSale && displayFlashDiscount > 0}
              <span class="ds-divider">+</span>
            {/if}
            <span class="ds-promo-badge">
              <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
              {promoApplied?.code ?? "PROMO"}
            </span>
            <span class="ds-text">Hemat</span>
            <span class="ds-amount ds-promo">{fmt(discountAmount)}</span>
          {/if}

          {#if displayIsFlashSale && displayFlashDiscount > 0 && discountAmount > 0}
            <span class="ds-divider">·</span>
            <span class="ds-total-save"
              >Total hemat {fmt(displayFlashDiscount + discountAmount)}</span
            >
          {/if}
        </div>
      </div>
    {/if}

    <div class="bar-glow-line"></div>

    <div class="bar-inner">
      <div class="bar-info">
        {#if reviewLoading}
          <div class="h-5 w-24 rounded-md bg-white/10 animate-pulse mb-1"></div>
          <div class="h-3 w-32 rounded bg-white/10 animate-pulse"></div>
        {:else}
          <span class="bar-price">{fmt(displayTotal)}</span>
          <span class="bar-meta">
            {selected.label}
            {#if selectedPay}
              <img src={selectedPay.logo} width="50" alt="" />
            {/if}
          </span>
        {/if}
      </div>

      <button
        disabled={!internalCanOrder || reviewLoading}
        class="bar-btn {internalCanOrder && !reviewLoading
          ? 'bar-btn-active'
          : 'bar-btn-disabled'}"
        onclick={() => {
          if (internalCanOrder && !reviewLoading) showConfirmModal = true;
        }}
      >
        {#if internalCanOrder && !reviewLoading}
          <div class="bar-btn-shine"></div>
        {/if}
        {#if reviewLoading}
          <svg class="bar-spinner" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="rgba(0,0,0,0.25)"
              stroke-width="2.5"
            />
            <path
              d="M12 3a9 9 0 019 9"
              stroke="#000"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        {:else}
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        {/if}
        {internalCanOrder
          ? reviewLoading
            ? "Memuat..."
            : "Pesan Sekarang"
          : orderHint()}
      </button>
    </div>
  </div>
{/if}

<!-- Payment hints -->
<div class="flex flex-wrap items-center justify-center gap-2 px-2">
  {#each ["💳 Transfer", "📱 QRIS", "🏧 ATM", "💰 COD"] as m, i}
    <span class="text-[10px] text-white/25 font-medium">{m}</span>
    {#if i < 3}<span class="text-white/10">·</span>{/if}
  {/each}
</div>

<style>
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

  /* Toast */
  .toast {
    position: fixed;
    top: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    border: 1px solid;
    backdrop-filter: blur(12px);
    font-size: 0.8125rem;
    font-weight: 600;
    max-width: calc(100vw - 2rem);
    white-space: normal;
    animation: toastIn 280ms cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }
  .toast-error {
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.3);
    color: #fca5a5;
  }
  .toast-success {
    background: rgba(52, 211, 153, 0.12);
    border-color: rgba(52, 211, 153, 0.3);
    color: #6ee7b7;
  }
  .toast-info {
    background: rgba(245, 197, 24, 0.1);
    border-color: rgba(245, 197, 24, 0.25);
    color: white;
  }

  .toast-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }
  .toast-msg {
    flex: 1;
    line-height: 1.4;
  }
  .toast-close {
    flex-shrink: 0;
    margin-left: 0.25rem;
    opacity: 0.5;
    cursor: pointer;
    background: none;
    border: none;
    color: inherit;
    padding: 0.125rem;
    transition: opacity 150ms;
  }
  .toast-close:hover {
    opacity: 1;
  }

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-0.75rem);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  /* Mobile bar */
  .mobile-order-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9998;
    background: linear-gradient(
      180deg,
      rgba(10, 10, 10, 0.65) 0%,
      rgba(8, 8, 8, 0.92) 100%
    );
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    padding: 0.875rem 1rem calc(0.875rem + env(safe-area-inset-bottom));
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  .bar-glow-line {
    position: absolute;
    top: -1px;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(245, 197, 24, 0.6) 30%,
      rgba(245, 197, 24, 0.9) 50%,
      rgba(245, 197, 24, 0.6) 70%,
      transparent
    );
    filter: blur(0.5px);
  }

  .mobile-order-bar::before {
    content: "";
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 40px;
    background: radial-gradient(
      ellipse at 50% 0%,
      rgba(245, 197, 24, 0.08),
      transparent 70%
    );
    pointer-events: none;
  }

  .bar-inner {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    position: relative;
    padding-top: 0.625rem;
  }
  .bar-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .bar-price {
    font-size: 1.125rem;
    font-weight: 900;
    color: var(--color-primary);
    letter-spacing: -0.02em;
    line-height: 1;
    text-shadow: 0 0 20px rgba(245, 197, 24, 0.4);
  }
  .bar-meta {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.35);
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .bar-btn {
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 1.25rem;
    border-radius: 0.875rem;
    border: none;
    font-size: 0.875rem;
    font-weight: 900;
    letter-spacing: 0.01em;
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
  }
  .bar-btn-active {
    background: var(--color-primary);
    color: #000;
    cursor: pointer;
    box-shadow:
      0 0 0 1px rgba(245, 197, 24, 0.3),
      0 4px 20px rgba(245, 197, 24, 0.35),
      0 0 40px rgba(245, 197, 24, 0.15);
  }
  .bar-btn-active:active {
    transform: scale(0.96);
    box-shadow:
      0 0 0 1px rgba(245, 197, 24, 0.3),
      0 2px 10px rgba(245, 197, 24, 0.3);
  }
  .bar-btn-disabled {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .bar-btn-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 35%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 65%
    );
    animation: shine 2.5s infinite;
    pointer-events: none;
  }

  .bar-spinner {
    width: 1rem;
    height: 1rem;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Discount strip */
  .discount-strip {
    padding: 0.625rem 0;
    padding-top: 0;
    margin-bottom: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .discount-strip-inner {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .ds-flash-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    font-size: 0.5625rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .ds-promo-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    background: rgba(52, 211, 153, 0.12);
    border: 1px solid rgba(52, 211, 153, 0.25);
    color: #6ee7b7;
    font-size: 0.5625rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .ds-text {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
  }
  .ds-amount {
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: -0.01em;
  }
  .ds-flash {
    color: #f87171;
  }
  .ds-promo {
    color: #34d399;
  }
  .ds-divider {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.2);
    font-weight: 500;
  }
  .ds-total-save {
    font-size: 0.625rem;
    font-weight: 700;
    color: rgba(245, 197, 24, 0.6);
    white-space: nowrap;
  }
</style>
