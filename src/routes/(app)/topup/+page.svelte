<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/auth";
  import { goto } from "$app/navigation";

  const quickAmounts = [10000, 50000, 100000, 250000, 500000, 1000000];
  let amount = $state(10000);
  let customAmount = $state("");
  let paymentMethods = $state<any[]>([]);
  let selectedPayment = $state<any>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let mounted = $state(false);

  function fmtRp(v: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(v);
  }

  // Nominal aktif (custom override quickAmount)
  let finalAmount = $derived(
    customAmount && Number(customAmount) > 0 ? Number(customAmount) : amount,
  );

  // Hitung fee berdasarkan metode terpilih
  let fee = $derived(() => {
    if (!selectedPayment) return 0;
    if (selectedPayment.feeType === "flat")
      return selectedPayment.feeValue ?? 0;
    if (selectedPayment.feeType === "percent")
      return Math.ceil((finalAmount * (selectedPayment.feeValue ?? 0)) / 100);
    return 0;
  });

  let totalAmount = $derived(finalAmount + fee());

  // Validasi
  let amountError = $derived(() => {
    if (!finalAmount || finalAmount < 1000) return "Nominal minimum Rp 1.000";
    if (selectedPayment?.minAmount && finalAmount < selectedPayment.minAmount)
      return `Minimum ${fmtRp(selectedPayment.minAmount)} untuk metode ini`;
    if (selectedPayment?.maxAmount && finalAmount > selectedPayment.maxAmount)
      return `Maksimum ${fmtRp(selectedPayment.maxAmount)} untuk metode ini`;
    return null;
  });

  let canSubmit = $derived(
    !loading && !!selectedPayment && !amountError() && finalAmount > 0,
  );

  // Group payment methods
  let groupedMethods = $derived(() => {
    const groups: Record<string, any[]> = {};
    for (const m of paymentMethods) {
      const g = m.group ?? "lainnya";
      if (!groups[g]) groups[g] = [];
      groups[g].push(m);
    }
    return groups;
  });

  const groupLabels: Record<string, string> = {
    va: "Virtual Account",
    qris: "QRIS",
    ewallet: "E-Wallet",
    retail: "Minimarket",
    lainnya: "Lainnya",
  };

  onMount(async () => {
    auth.init();
    if (!auth.isLoggedIn) {
      await goto("/auth/login");
      return;
    }
    const res = await fetch("/api/v1/payments/available");
    const json = await res.json();
    paymentMethods = (json?.data ?? []).filter(
      (item: any) => item.source !== "BALANCE" && item.group !== "balance",
    );
    setTimeout(() => (mounted = true), 50);
  });

  async function submitTopup() {
    if (!canSubmit) return;
    loading = true;
    error = null;
    try {
      const res = await fetch("/api/v1/users/balance-topups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          amount: finalAmount,
          paymentMethodId: selectedPayment?.id,
        }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(
          json?.data?.message ?? json?.message ?? "Gagal membuat topup",
        );
      await goto(`/topup/invoice/${json?.data?.topupCode}`);
    } catch (e: any) {
      error = e?.message ?? "Gagal membuat topup";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Topup T-Coins</title>
</svelte:head>

<div class="min-h-screen text-white px-4 py-10">
  <!-- Ambient glow -->
  <div
    class="pointer-events-none fixed inset-0 overflow-hidden"
    aria-hidden="true"
  >
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-[0.035]"
      style="background: radial-gradient(ellipse, #f5c518 0%, transparent 70%);"
    ></div>
  </div>

  <div
    class="relative max-w-5xl mx-auto transition-all duration-500"
    class:opacity-0={!mounted}
    class:translate-y-3={!mounted}
    class:opacity-100={mounted}
    class:translate-y-0={mounted}
  >
    <!-- Page header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-1">
        <button
          onclick={() => goto("/account")}
          class="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
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
              stroke-width="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Akun
        </button>
        <span class="text-white/20 text-xs">/</span>
        <span class="text-xs text-white/40">Topup</span>
      </div>
      <p
        class="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)] mb-2"
      >
        Isi Saldo
      </p>
      <h1 class="text-2xl md:text-3xl font-black leading-tight">
        Topup T-Coins
      </h1>
      <p class="text-sm text-white/45 mt-1.5">
        Pilih nominal, pilih metode pembayaran, lalu selesaikan transaksi.
      </p>
    </div>

    <div class="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <!-- LEFT: Nominal + Payment -->
      <div class="space-y-5">
        <!-- Step 1: Nominal -->
        <section
          class="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden"
        >
          <div class="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div class="flex items-center gap-3">
              <div
                class="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shrink-0"
              >
                <span class="text-[11px] font-black text-black">1</span>
              </div>
              <div>
                <h2 class="text-sm font-bold">Pilih Nominal</h2>
                <p class="text-[11px] text-white/40 mt-0.5">
                  Pilih dari nominal cepat atau isi sendiri
                </p>
              </div>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <!-- Quick amounts grid -->
            <div class="grid grid-cols-3 gap-2.5">
              {#each quickAmounts as item}
                {@const active = amount === item && !customAmount}
                <button
                  onclick={() => {
                    amount = item;
                    customAmount = "";
                  }}
                  class="relative rounded-2xl border px-3 py-3.5 text-left transition-all duration-150 active:scale-[0.97] {active
                    ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'}"
                >
                  {#if active}
                    <span
                      class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                    >
                      <svg
                        class="w-2.5 h-2.5 text-black"
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
                    </span>
                  {/if}
                  <p class="text-[10px] text-white/40 mb-1">Nominal</p>
                  <p
                    class="text-sm font-black {active
                      ? 'text-[var(--color-primary)]'
                      : 'text-white'}"
                  >
                    {fmtRp(item)}
                  </p>
                </button>
              {/each}
            </div>

            <!-- Custom amount -->
            <div>
              <label
                class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 block mb-2"
              >
                Atau isi nominal lain
              </label>
              <div class="relative">
                <span
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40"
                >
                  Rp
                </span>
                <input
                  type="number"
                  min="1000"
                  bind:value={customAmount}
                  oninput={() => {
                    if (customAmount) amount = 0;
                  }}
                  class="w-full rounded-2xl border bg-white/[0.04] pl-10 pr-4 py-3 text-sm font-semibold outline-none transition-all
                    {customAmount
                    ? 'border-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/70 bg-[var(--color-primary)]/[0.05]'
                    : 'border-white/[0.08] focus:border-white/20'}"
                  placeholder="Contoh: 200000"
                />
              </div>
              {#if amountError()}
                <p class="text-[11px] text-red-400 mt-1.5">{amountError()}</p>
              {/if}
            </div>
          </div>
        </section>

        <!-- Step 2: Payment Method -->
        <section
          class="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden"
        >
          <div class="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div class="flex items-center gap-3">
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors {selectedPayment
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-white/10'}"
              >
                <span
                  class="text-[11px] font-black {selectedPayment
                    ? 'text-black'
                    : 'text-white/60'}">2</span
                >
              </div>
              <div>
                <h2 class="text-sm font-bold">Metode Pembayaran</h2>
                <p class="text-[11px] text-white/40 mt-0.5">
                  {selectedPayment
                    ? selectedPayment.paymentName + " terpilih"
                    : "Pilih cara pembayaran"}
                </p>
              </div>
            </div>
          </div>

          <div class="p-5 space-y-5">
            {#each Object.entries(groupedMethods()) as [group, methods]}
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 mb-2.5"
                >
                  {groupLabels[group] ?? group}
                </p>
                <div class="space-y-2">
                  {#each methods as method}
                    {@const active = selectedPayment?.id === method.id}
                    <button
                      onclick={() => (selectedPayment = method)}
                      class="w-full rounded-2xl border px-4 py-3 flex items-center gap-3 text-left transition-all duration-150 active:scale-[0.99] {active
                        ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/[0.07]'
                        : 'border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]'}"
                    >
                      <div
                        class="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white p-1"
                      >
                        <img
                          src={method.thumbnail}
                          alt={method.paymentName}
                          class="w-full h-full object-contain"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          class="font-semibold text-sm truncate {active
                            ? 'text-[var(--color-primary)]'
                            : 'text-white'}"
                        >
                          {method.paymentName}
                        </p>
                        <p class="text-[11px] text-white/40 mt-0.5">
                          {method.feeType === "flat"
                            ? `Fee: ${fmtRp(method.feeValue ?? 0)}`
                            : method.feeType === "percent"
                              ? `Fee: ${method.feeValue}%`
                              : "Tanpa biaya tambahan"}
                        </p>
                      </div>
                      <!-- Radio indicator -->
                      <div
                        class="shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all {active
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                          : 'border-white/20'}"
                      >
                        {#if active}
                          <div class="w-1.5 h-1.5 rounded-full bg-black"></div>
                        {/if}
                      </div>
                    </button>
                  {/each}
                </div>
              </div>
            {/each}

            {#if paymentMethods.length === 0}
              <div class="py-8 text-center">
                <div
                  class="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-white/10 border-t-white/40 animate-spin"
                ></div>
                <p class="text-sm text-white/40">Memuat metode pembayaran...</p>
              </div>
            {/if}
          </div>
        </section>
      </div>

      <!-- RIGHT: Summary + CTA -->
      <div class="lg:sticky lg:top-6 space-y-4">
        <div
          class="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden"
        >
          <!-- Summary header -->
          <div class="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div class="flex items-center gap-3">
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors {canSubmit
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-white/10'}"
              >
                <span
                  class="text-[11px] font-black {canSubmit
                    ? 'text-black'
                    : 'text-white/60'}">3</span
                >
              </div>
              <div>
                <h2 class="text-sm font-bold">Ringkasan Pembayaran</h2>
                <p class="text-[11px] text-white/40 mt-0.5">
                  Periksa sebelum melanjutkan
                </p>
              </div>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <!-- Amount breakdown -->
            <div
              class="rounded-2xl border border-white/[0.07] bg-white/[0.025] divide-y divide-white/[0.06]"
            >
              <div class="flex items-center justify-between px-4 py-3">
                <span class="text-xs text-white/50">Nominal Topup</span>
                <span class="text-sm font-bold text-white"
                  >{fmtRp(finalAmount)}</span
                >
              </div>
              <div class="flex items-center justify-between px-4 py-3">
                <span class="text-xs text-white/50">Biaya Layanan</span>
                <span
                  class="text-sm font-semibold {fee() > 0
                    ? 'text-white/70'
                    : 'text-white/30'}"
                >
                  {fee() > 0 ? "+ " + fmtRp(fee()) : "Gratis"}
                </span>
              </div>
              <div
                class="flex items-center justify-between px-4 py-3.5 bg-[var(--color-primary)]/[0.05]"
              >
                <span class="text-xs font-bold text-white/70">Total Bayar</span>
                <span class="text-lg font-black text-[var(--color-primary)]">
                  {fmtRp(totalAmount)}
                </span>
              </div>
            </div>

            <!-- Selected payment preview -->
            {#if selectedPayment}
              <div
                class="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"
              >
                <div
                  class="w-8 h-8 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center"
                >
                  <img
                    src={selectedPayment.thumbnail}
                    alt={selectedPayment.paymentName}
                    class="w-full h-full object-contain"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold truncate">
                    {selectedPayment.paymentName}
                  </p>
                  <p class="text-[10px] text-white/40">
                    {selectedPayment.source}
                  </p>
                </div>
                <button
                  onclick={() => (selectedPayment = null)}
                  class="ml-auto shrink-0 text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Ganti metode"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            {:else}
              <div
                class="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-center"
              >
                <p class="text-xs text-white/35">Belum ada metode dipilih</p>
              </div>
            {/if}

            <!-- Error -->
            {#if error}
              <div
                class="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3"
              >
                <svg
                  class="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p class="text-xs text-red-300">{error}</p>
              </div>
            {/if}

            <!-- CTA -->
            <button
              disabled={!canSubmit}
              onclick={submitTopup}
              class="w-full rounded-2xl py-4 font-black text-sm transition-all active:scale-[0.98]
                {canSubmit
                ? 'bg-[var(--color-primary)] text-black hover:brightness-110 cursor-pointer shadow-[0_8px_24px_rgba(245,197,24,0.2)]'
                : 'bg-white/[0.06] text-white/30 cursor-not-allowed'}"
            >
              {#if loading}
                <span class="flex items-center justify-center gap-2">
                  <svg
                    class="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Memproses...
                </span>
              {:else if !selectedPayment}
                Pilih Metode Dulu
              {:else if amountError()}
                Periksa Nominal
              {:else}
                Lanjut Bayar {fmtRp(totalAmount)}
              {/if}
            </button>

            <p class="text-center text-[10px] text-white/25 leading-relaxed">
              Dengan melanjutkan, kamu menyetujui syarat & ketentuan topup yang
              berlaku.
            </p>
          </div>
        </div>

        <!-- Security note -->
        <div class="flex items-center gap-2 px-2">
          <svg
            class="w-3.5 h-3.5 text-white/25 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p class="text-[10px] text-white/25">
            Transaksi diproses aman via Midtrans. Data pembayaranmu tidak
            disimpan.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
