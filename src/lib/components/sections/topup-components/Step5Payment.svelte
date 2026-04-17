<script lang="ts">
  import type { Product, PaymentMethod, PromoApplied } from "./types";
  import { fmt } from "./utils";
  import { onMount } from "svelte";
  import { auth, type User } from "$lib/auth";
  import { toastStore } from "$lib/components/Toast/state";

  let {
    selectedPay = $bindable(null),
    basePrice,
    selected,
    token,
    user,
    promoApplied = null,
  }: {
    selectedPay: any;
    basePrice: number;
    selected: Product | null;
    token: string;
    user: User;
    promoApplied?: PromoApplied | null;
  } = $props();

  let paymentBalance = $state<PaymentMethod[]>([]);
  let paymentQris = $state<PaymentMethod[]>([]);
  let paymentEwallet = $state<PaymentMethod[]>([]);
  let paymentVa = $state<PaymentMethod[]>([]);
  let prices = $state<any[]>([]);

  let qrisOpen = $state(false);
  let ewalletOpen = $state(false);
  let vaOpen = $state(false);
  let getPricesLoading = $state(false);
  let isValidLogin = $state(false);
  let methodsLoaded = $state(false);

  /* ── Auth ── */
  const initAuth = async () => {
    if (user) {
      const newUser = await auth.verifySelf(token);
      if (newUser) {
        auth.setAuth(token, newUser);
        isValidLogin = true;
      }
    }
  };

  /* ── Load payment methods ── */
  onMount(async () => {
    auth.init();
    initAuth();
    try {
      const res = await fetch("/api/v1/payments/available");
      if (!res.ok) return;
      const paymentMethods: any[] = (await res.json()).data;
      paymentBalance = [];
      paymentQris = [];
      paymentVa = [];
      paymentEwallet = [];
      paymentMethods
        .filter((p) => p.paymentVisibility === "active")
        .forEach((p) => {
          const method: PaymentMethod = {
            id: p.id,
            name: p.paymentName,
            autoCheck: p.group !== "balance",
            logo: p.thumbnail,
            requiredLogin: p.group === "balance",
          };
          if (p.group === "balance")
            paymentBalance = [...paymentBalance, method];
          else if (p.group === "qris") paymentQris = [...paymentQris, method];
          else if (p.group === "va") paymentVa = [...paymentVa, method];
          else if (p.group === "ewallet")
            paymentEwallet = [...paymentEwallet, method];
        });
      methodsLoaded = true;
    } catch (err) {
      console.error("Gagal fetch payment methods:", err);
    }
  });

  /* ── Fetch prices ── */
  $effect(() => {
    if (!selected) {
      prices = [];
      return;
    }
    const controller = new AbortController();
    fetchPrices(
      selected.productFlashId || selected.id,
      selected.productFlashId ? selected.id : null,
      controller.signal,
    );
    return () => controller.abort();
  });

  async function fetchPrices(
    itemId: string,
    flashId: any,
    signal?: AbortSignal,
  ) {
    getPricesLoading = true;
    try {
      const res = await fetch("/api/v1/payments/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          qty: 1,
          ...(flashId ? { flashId } : {}),
          ...(promoApplied?.code ? { promoCode: promoApplied.code } : {}),
        }),
        signal,
      });
      if (!res.ok) return;
      const data = await res.json();
      prices = Array.isArray(data) ? data : (data.data ?? []);
    } catch (err: any) {
      if (err.name !== "AbortError") console.error("Gagal fetch harga:", err);
    } finally {
      getPricesLoading = false;
    }
  }

  /* ── Price helpers ── */
  function methodPrice(m: PaymentMethod): number {
    return prices?.find((p) => p.id === m.id)?.total_price ?? basePrice;
  }
  function methodValid(m: PaymentMethod): boolean {
    return prices?.find((p) => p.id === m.id)?.valid ?? true;
  }
  function methodInvalidReason(m: PaymentMethod): string | null {
    return prices?.find((p) => p.id === m.id)?.reason ?? null;
  }
  function shortInvalidReason(m: PaymentMethod): string | null {
    const reason = methodInvalidReason(m);
    if (!reason) return null;
    const minMatch = reason.match(/Rp\s([\d.]+)/i);
    if (reason.toLowerCase().includes("minimal") && minMatch?.[1])
      return `Min Rp ${minMatch[1]}`;
    const maxMatch = reason.match(/Rp\s([\d.]+)/i);
    if (reason.toLowerCase().includes("maksimal") && maxMatch?.[1])
      return `Max Rp ${maxMatch[1]}`;
    return reason;
  }
  function invalidMethods(methods: PaymentMethod[]) {
    return methods
      .map((m) => ({
        id: m.id,
        name: m.name,
        reason: methodInvalidReason(m) ?? "",
      }))
      .filter((m) => !!m.reason);
  }

  const unavailablePayments = $derived(
    invalidMethods([
      ...paymentBalance,
      ...paymentQris,
      ...paymentEwallet,
      ...paymentVa,
    ]),
  );

  /* ── Select handler ── */
  function selectMethod(m: PaymentMethod) {
    if (!methodValid(m)) return;
    if (m.requiredLogin && !isValidLogin) {
      toastStore.show("Silakan login untuk menggunakan " + m.name, "error");
      return;
    }
    selectedPay = m;
  }
</script>

<div class="step-card">
  <div class="step-accent" aria-hidden="true"></div>

  <div class="card-inner">
    <!-- ── Header ── -->
    <div class="step-header">
      <div class="step-badge"><span>5</span></div>
      <div class="header-text">
        <h3 class="step-title">Pilih Pembayaran</h3>
        <p class="step-subtitle">Semua transaksi diproses dengan aman</p>
      </div>
      {#if getPricesLoading}
        <div class="price-loading-pill">
          <svg
            class="price-spin"
            viewBox="0 0 24 24"
            fill="none"
            width="11"
            height="11"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="rgba(245,197,24,0.3)"
              stroke-width="2.5"
            />
            <path
              d="M12 3a9 9 0 019 9"
              stroke="var(--color-primary)"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
          <span>Memuat harga</span>
        </div>
      {/if}
    </div>

    <!-- ─────────────────────────────────────
         BALANCE — full-width featured card
    ───────────────────────────────────── -->
    {#if paymentBalance.length > 0}
      <div class="section-label">
        <span class="section-label-line"></span>
        <span class="section-label-text">Saldo Akun</span>
        <span class="section-label-line"></span>
      </div>
      <div class="balance-group">
        {#each paymentBalance as m}
          {@const isSel = selectedPay?.id === m.id}
          {@const valid = methodValid(m)}
          <button
            type="button"
            class="balance-card"
            class:balance-selected={isSel}
            class:balance-invalid={!valid}
            onclick={() => selectMethod(m)}
            disabled={!valid}
            aria-pressed={isSel}
          >
            {#if isSel}<div class="sel-ring" aria-hidden="true"></div>{/if}

            <!-- Radio -->
            <div class="radio-wrap" class:radio-active={isSel}>
              {#if isSel}<div class="radio-dot"></div>{/if}
            </div>

            <!-- Logo -->
            {#if m.logo}
              <div class="balance-logo-wrap">
                <img
                  src={m.logo}
                  alt={m.name}
                  class="pay-logo"
                  loading="lazy"
                />
              </div>
            {/if}

            <!-- Info -->
            <div class="balance-info">
              <span class="balance-name">{m.name}</span>
              {#if m.requiredLogin && !isValidLogin}
                <span class="login-required-badge">Login diperlukan</span>
              {/if}
              {#if !valid}
                <span class="invalid-reason">{shortInvalidReason(m)}</span>
              {/if}
            </div>

            <!-- Price -->
            <div class="pay-price-wrap">
              {#if selected}
                {#if getPricesLoading}
                  <div class="price-skel"></div>
                {:else}
                  <span class="pay-price" class:pay-price-selected={isSel}>
                    {fmt(methodPrice(m))}
                  </span>
                {/if}
              {/if}
            </div>
          </button>
        {/each}
      </div>
    {/if}

    <!-- ─────────────────────────────────────
         QRIS accordion
    ───────────────────────────────────── -->
    {#if paymentQris.length > 0}
      <div class="accordion" class:accordion-open={qrisOpen}>
        <button
          type="button"
          class="accordion-head"
          onclick={() => (qrisOpen = !qrisOpen)}
          aria-expanded={qrisOpen}
        >
          <div class="accordion-head-left">
            <div class="accordion-icon-wrap accordion-icon-qris">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="14"
                height="14"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.657 17.657l-.707-.707M12 20v-1m-5.657-1.636l.707-.707M4 12H3m2.343-5.657l.707.707"
                />
              </svg>
            </div>
            <div>
              <span class="accordion-title">QRIS</span>
              <span class="accordion-sub">All Payment</span>
            </div>
          </div>
          <div class="accordion-head-right">
            <span class="method-count">{paymentQris.length}</span>
            <svg
              class="chevron"
              class:chevron-open={qrisOpen}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="14"
              height="14"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {#if qrisOpen}
          <div class="accordion-body">
            <div class="grid-cards">
              {#each paymentQris as m}
                {@const isSel = selectedPay?.id === m.id}
                {@const valid = methodValid(m)}
                <button
                  type="button"
                  class="grid-card"
                  class:grid-selected={isSel}
                  class:grid-invalid={!valid}
                  onclick={() => selectMethod(m)}
                  disabled={!valid}
                  title={methodInvalidReason(m) ?? ""}
                  aria-pressed={isSel}
                >
                  {#if isSel}<div
                      class="sel-ring"
                      aria-hidden="true"
                    ></div>{/if}
                  {#if isSel}
                    <div class="check-mark" aria-label="Terpilih">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        width="9"
                        height="9"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  {/if}
                  <div class="grid-card-logo">
                    {#if m.logo}
                      <img
                        src={m.logo}
                        alt={m.name}
                        class="pay-logo-grid"
                        loading="lazy"
                      />
                    {:else}
                      <span class="grid-card-name-fallback">{m.name}</span>
                    {/if}
                  </div>
                  <div class="grid-card-bottom">
                    {#if selected}
                      {#if getPricesLoading}
                        <div class="price-skel price-skel-sm"></div>
                      {:else}
                        <span class="grid-price" class:grid-price-sel={isSel}
                          >{fmt(methodPrice(m))}</span
                        >
                      {/if}
                    {/if}
                    {#if m.autoCheck}
                      <span class="auto-badge">⚡ Auto</span>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- ─────────────────────────────────────
         E-WALLET accordion
    ───────────────────────────────────── -->
    {#if paymentEwallet.length > 0}
      <div class="accordion" class:accordion-open={ewalletOpen}>
        <button
          type="button"
          class="accordion-head"
          onclick={() => (ewalletOpen = !ewalletOpen)}
          aria-expanded={ewalletOpen}
        >
          <div class="accordion-head-left">
            <div class="accordion-icon-wrap accordion-icon-ewallet">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="14"
                height="14"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <span class="accordion-title">E-Wallet</span>
              <span class="accordion-sub">Digital payment</span>
            </div>
          </div>
          <div class="accordion-head-right">
            <span class="method-count">{paymentEwallet.length}</span>
            <svg
              class="chevron"
              class:chevron-open={ewalletOpen}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="14"
              height="14"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {#if ewalletOpen}
          <div class="accordion-body">
            <div class="grid-cards">
              {#each paymentEwallet as m}
                {@const isSel = selectedPay?.id === m.id}
                {@const valid = methodValid(m)}
                <button
                  type="button"
                  class="grid-card"
                  class:grid-selected={isSel}
                  class:grid-invalid={!valid}
                  onclick={() => selectMethod(m)}
                  disabled={!valid}
                  title={methodInvalidReason(m) ?? ""}
                  aria-pressed={isSel}
                >
                  {#if isSel}<div
                      class="sel-ring"
                      aria-hidden="true"
                    ></div>{/if}
                  {#if isSel}
                    <div class="check-mark" aria-label="Terpilih">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        width="9"
                        height="9"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  {/if}
                  <div class="grid-card-logo">
                    {#if m.logo}
                      <img
                        src={m.logo}
                        alt={m.name}
                        class="pay-logo-grid"
                        loading="lazy"
                      />
                    {:else}
                      <span class="grid-card-name-fallback">{m.name}</span>
                    {/if}
                  </div>
                  <div class="grid-card-bottom">
                    {#if selected}
                      {#if getPricesLoading}
                        <div class="price-skel price-skel-sm"></div>
                      {:else}
                        <span class="grid-price" class:grid-price-sel={isSel}
                          >{fmt(methodPrice(m))}</span
                        >
                      {/if}
                    {/if}
                    {#if m.autoCheck}
                      <span class="auto-badge">⚡ Auto</span>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- ─────────────────────────────────────
         VIRTUAL ACCOUNT accordion
    ───────────────────────────────────── -->
    {#if paymentVa.length > 0}
      <div class="accordion" class:accordion-open={vaOpen}>
        <button
          type="button"
          class="accordion-head"
          onclick={() => (vaOpen = !vaOpen)}
          aria-expanded={vaOpen}
        >
          <div class="accordion-head-left">
            <div class="accordion-icon-wrap accordion-icon-va">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="14"
                height="14"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </div>
            <div>
              <span class="accordion-title">Virtual Account</span>
              <span class="accordion-sub">Transfer bank</span>
            </div>
          </div>
          <div class="accordion-head-right">
            <span class="method-count">{paymentVa.length}</span>
            <svg
              class="chevron"
              class:chevron-open={vaOpen}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="14"
              height="14"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {#if vaOpen}
          <div class="accordion-body">
            <div class="va-list">
              {#each paymentVa as m}
                {@const isSel = selectedPay?.id === m.id}
                {@const valid = methodValid(m)}
                <button
                  type="button"
                  class="va-row"
                  class:va-selected={isSel}
                  class:va-invalid={!valid}
                  onclick={() => selectMethod(m)}
                  disabled={!valid}
                  title={methodInvalidReason(m) ?? ""}
                  aria-pressed={isSel}
                >
                  {#if isSel}<div
                      class="sel-ring"
                      aria-hidden="true"
                    ></div>{/if}

                  <div class="radio-wrap" class:radio-active={isSel}>
                    {#if isSel}<div class="radio-dot"></div>{/if}
                  </div>

                  {#if m.logo}
                    <div class="va-logo-wrap">
                      <img
                        src={m.logo}
                        alt={m.name}
                        class="pay-logo-va"
                        loading="lazy"
                      />
                    </div>
                  {/if}

                  <div class="va-info">
                    <span class="va-name">{m.name}</span>
                    {#if !valid && shortInvalidReason(m)}
                      <span class="invalid-reason">{shortInvalidReason(m)}</span
                      >
                    {/if}
                  </div>

                  <div class="va-price-wrap">
                    {#if selected}
                      {#if getPricesLoading}
                        <div class="price-skel"></div>
                      {:else}
                        <span class="va-price" class:va-price-sel={isSel}
                          >{fmt(methodPrice(m))}</span
                        >
                      {/if}
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- ── Unavailable notice ── -->
    {#if unavailablePayments.length > 0}
      <div class="unavail-box">
        <div class="unavail-header">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="13"
            height="13"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <span>Tidak tersedia untuk nominal ini</span>
        </div>
        <div class="unavail-list">
          {#each unavailablePayments as item}
            <div class="unavail-item">
              <span class="unavail-name">{item.name}</span>
              <span class="unavail-reason">{item.reason}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* ── Shell ── */
  .step-card {
    position: relative;
    border-radius: 1.125rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #0f0f0f;
    overflow: hidden;
  }
  .step-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--color-primary),
      rgba(245, 197, 24, 0.3) 55%,
      transparent
    );
    z-index: 1;
  }
  .card-inner {
    padding: 1.25rem 1.25rem 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  /* ── Header ── */
  .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.375rem;
  }
  .step-badge {
    width: 1.875rem;
    height: 1.875rem;
    border-radius: 0.625rem;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.8125rem;
    font-weight: 900;
    color: #000;
    box-shadow: 0 0 14px rgba(245, 197, 24, 0.3);
  }
  .header-text {
    flex: 1;
    min-width: 0;
  }
  .step-title {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
  }
  .step-subtitle {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 0.1rem;
  }

  .price-loading-pill {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    background: rgba(245, 197, 24, 0.08);
    border: 1px solid rgba(245, 197, 24, 0.18);
    color: rgba(245, 197, 24, 0.7);
    font-size: 0.5625rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
  .price-spin {
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ── Section label divider ── */
  .section-label {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-top: 0.125rem;
  }
  .section-label-line {
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
  }
  .section-label-text {
    font-size: 0.5625rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.2);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    white-space: nowrap;
  }

  /* ── Shared: selection ring ── */
  .sel-ring {
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    border: 1.5px solid var(--color-primary);
    pointer-events: none;
    z-index: 3;
    box-shadow:
      0 0 16px rgba(245, 197, 24, 0.18),
      inset 0 0 10px rgba(245, 197, 24, 0.04);
  }

  /* ── Shared: check mark ── */
  .check-mark {
    position: absolute;
    top: 0.45rem;
    right: 0.45rem;
    z-index: 10;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: var(--color-primary);
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(245, 197, 24, 0.4);
  }

  /* ── Shared: radio ── */
  .radio-wrap {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.2s;
  }
  .radio-active {
    border-color: var(--color-primary);
  }
  .radio-dot {
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
    background: var(--color-primary);
  }

  /* ── Shared: price skeleton ── */
  .price-skel {
    height: 14px;
    width: 5rem;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.07);
    animation: pulse 1.4s ease-in-out infinite;
  }
  .price-skel-sm {
    height: 11px;
    width: 3.5rem;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  /* ── Shared: invalid reason ── */
  .invalid-reason {
    font-size: 0.5625rem;
    color: #f87171;
    margin-top: 0.1rem;
    display: block;
  }

  /* ── Shared: login badge ── */
  .login-required-badge {
    font-size: 0.5625rem;
    font-weight: 700;
    color: rgba(245, 197, 24, 0.7);
    background: rgba(245, 197, 24, 0.08);
    border: 1px solid rgba(245, 197, 24, 0.15);
    padding: 0.1rem 0.375rem;
    border-radius: 0.3rem;
    display: inline-flex;
    margin-top: 0.1rem;
  }

  /* ── Auto badge ── */
  .auto-badge {
    font-size: 0.5rem;
    font-weight: 800;
    color: #34d399;
    letter-spacing: 0.04em;
  }

  /* ── Balance cards ── */
  .balance-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .balance-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .balance-card:hover:not(.balance-selected):not(.balance-invalid) {
    border-color: rgba(255, 255, 255, 0.13);
    background: rgba(255, 255, 255, 0.055);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  }
  .balance-selected {
    background: rgba(245, 197, 24, 0.07) !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  }
  .balance-invalid {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .balance-logo-wrap {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.07);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .pay-logo {
    max-height: 1.25rem;
    max-width: 2rem;
    object-fit: contain;
  }

  .balance-info {
    flex: 1;
    min-width: 0;
  }
  .balance-name {
    font-size: 0.875rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    display: block;
  }

  .pay-price-wrap {
    flex-shrink: 0;
  }
  .pay-price {
    font-size: 0.9375rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.8);
    font-variant-numeric: tabular-nums;
    transition: color 0.2s;
  }
  .pay-price-selected {
    color: var(--color-primary);
  }

  /* ── Accordion ── */
  .accordion {
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .accordion-open {
    border-color: rgba(245, 197, 24, 0.18);
  }

  .accordion-head {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.18s;
  }
  .accordion-head:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  .accordion-open .accordion-head {
    background: rgba(245, 197, 24, 0.04);
  }

  .accordion-head-left {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }
  .accordion-icon-wrap {
    width: 1.875rem;
    height: 1.875rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid;
    transition: all 0.2s;
  }
  .accordion-icon-qris {
    background: rgba(245, 197, 24, 0.08);
    border-color: rgba(245, 197, 24, 0.2);
    color: var(--color-primary);
  }
  .accordion-icon-ewallet {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.25);
    color: #818cf8;
  }
  .accordion-icon-va {
    background: rgba(52, 211, 153, 0.08);
    border-color: rgba(52, 211, 153, 0.2);
    color: #34d399;
  }

  .accordion-title {
    font-size: 0.875rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.9);
    display: block;
    line-height: 1.2;
  }
  .accordion-sub {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 600;
  }

  .accordion-head-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .method-count {
    font-size: 0.5625rem;
    font-weight: 900;
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.3);
    padding: 0.1rem 0.45rem;
    border-radius: 9999px;
    min-width: 1.375rem;
    text-align: center;
  }
  .accordion-open .method-count {
    background: rgba(245, 197, 24, 0.12);
    color: var(--color-primary);
  }
  .chevron {
    color: rgba(255, 255, 255, 0.25);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .chevron-open {
    transform: rotate(180deg);
  }

  .accordion-body {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
  }

  /* ── Grid cards (QRIS / E-Wallet) ── */
  .grid-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  @media (min-width: 420px) {
    .grid-cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .grid-card {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    min-height: 5rem;
  }
  .grid-card:hover:not(.grid-selected):not(.grid-invalid) {
    border-color: rgba(255, 255, 255, 0.13);
    background: rgba(255, 255, 255, 0.055);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
  .grid-selected {
    background: rgba(245, 197, 24, 0.07) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
  .grid-invalid {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .grid-card-logo {
    display: flex;
    align-items: center;
  }
  .pay-logo-grid {
    max-height: 1.5rem;
    max-width: 100%;
    object-fit: contain;
    object-position: left;
  }
  .grid-card-name-fallback {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
  }

  .grid-card-bottom {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .grid-price {
    font-size: 0.75rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.75);
    font-variant-numeric: tabular-nums;
  }
  .grid-price-sel {
    color: var(--color-primary);
  }

  /* ── VA list ── */
  .va-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .va-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6875rem 0.875rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .va-row:hover:not(.va-selected):not(.va-invalid) {
    border-color: rgba(255, 255, 255, 0.13);
    background: rgba(255, 255, 255, 0.055);
  }
  .va-selected {
    background: rgba(245, 197, 24, 0.07) !important;
  }
  .va-invalid {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .va-logo-wrap {
    width: 3rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
  }
  .pay-logo-va {
    max-height: 1.5rem;
    max-width: 3rem;
    object-fit: contain;
  }

  .va-info {
    flex: 1;
    min-width: 0;
  }
  .va-name {
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
    display: block;
  }

  .va-price-wrap {
    flex-shrink: 0;
  }
  .va-price {
    font-size: 0.875rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.7);
    font-variant-numeric: tabular-nums;
  }
  .va-price-sel {
    color: var(--color-primary);
  }

  /* ── Unavailable notice ── */
  .unavail-box {
    padding: 0.75rem 0.875rem;
    border-radius: 0.875rem;
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.15);
    margin-top: 0.25rem;
  }
  .unavail-header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #f87171;
    font-size: 0.6875rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .unavail-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .unavail-item {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .unavail-name {
    font-size: 0.625rem;
    font-weight: 800;
    color: rgba(248, 113, 113, 0.8);
    white-space: nowrap;
  }
  .unavail-reason {
    font-size: 0.5625rem;
    color: rgba(248, 113, 113, 0.5);
    line-height: 1.4;
  }
</style>
