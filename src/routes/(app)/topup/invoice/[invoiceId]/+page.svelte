<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  const { data } = $props();
  const topup = data.topup;

  let mounted = $state(false);
  onMount(() => {
    setTimeout(() => (mounted = true), 50);
  });

  function formatRp(v: string | number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(v || 0));
  }

  const paymentDetails = topup?.paymentDetails ?? {};
  const qrString = paymentDetails?.qrString ?? paymentDetails?.qr_url ?? null;
  const vaNumber =
    paymentDetails?.vaNumber ?? paymentDetails?.va_number ?? null;
  const paymentCode =
    paymentDetails?.paymentCode ??
    paymentDetails?.payCode ??
    paymentDetails?.billKey ??
    paymentDetails?.bill_key ??
    null;
  const expiryTime =
    paymentDetails?.expiryTime ?? paymentDetails?.expiry_time ?? null;

  const status = topup?.paymentStatus ?? "PENDING";

  let copied = $state(false);
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Fallback untuk browser lama / non-HTTPS
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
      document.body.appendChild(el);
      el.focus();
      el.select();
      try {
        document.execCommand("copy");
        copied = true;
        setTimeout(() => (copied = false), 2000);
      } catch {
        // silent fail
      } finally {
        document.body.removeChild(el);
      }
    }
  }
</script>

<svelte:head>
  <title>Invoice {topup?.topupCode ?? ""}</title>
</svelte:head>

<div class="min-h-screen bg-[#050505] text-white px-4 py-10">
  <!-- Background ambient -->
  <div
    class="pointer-events-none fixed inset-0 overflow-hidden"
    aria-hidden="true"
  >
    <div
      class="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
      style="background: radial-gradient(circle, #f5c518 0%, transparent 70%);"
    ></div>
  </div>

  <div
    class="relative max-w-lg mx-auto transition-all duration-500"
    class:opacity-0={!mounted}
    class:translate-y-4={!mounted}
    class:opacity-100={mounted}
    class:translate-y-0={mounted}
  >
    <!-- Back nav -->
    <button
      onclick={() => goto("/account")}
      class="mb-6 flex items-center gap-2 text-xs text-white/45 hover:text-white/80 transition-colors"
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
      Kembali ke Akun
    </button>

    <!-- Main card -->
    <div
      class="rounded-3xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden"
    >
      <!-- Status header strip -->
      <div
        class="h-1 w-full"
        style={status === "SUCCESS"
          ? "background: linear-gradient(to right, #22c55e, #16a34a)"
          : status === "PENDING"
            ? "background: linear-gradient(to right, #f5c518, #fbbf24)"
            : "background: linear-gradient(to right, #ef4444, #dc2626)"}
      ></div>

      <div class="p-6">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2"
            >
              Invoice Topup
            </p>
            <h1 class="text-xl font-black text-white font-mono tracking-wide">
              {topup?.topupCode ?? "-"}
            </h1>
            <p class="text-xs text-white/40 mt-1.5">
              {topup?.createdAt
                ? new Date(topup.createdAt).toLocaleString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </p>
          </div>
          <!-- Status badge -->
          <div class="shrink-0">
            {#if status === "SUCCESS"}
              <span
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-[11px] font-bold"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                </svg>
                Berhasil
              </span>
            {:else if status === "PENDING"}
              <span
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-[11px] font-bold"
              >
                <span
                  class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block"
                ></span>
                Menunggu
              </span>
            {:else}
              <span
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-bold"
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
                    stroke-width="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Gagal
              </span>
            {/if}
          </div>
        </div>

        <!-- Amount cards -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <div
            class="relative overflow-hidden rounded-2xl border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/[0.06] p-4"
          >
            <div
              class="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-[var(--color-primary)]/8 pointer-events-none"
            ></div>
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-primary)]/80 mb-2"
            >
              Nominal Topup
            </p>
            <p
              class="text-xl font-black text-[var(--color-primary)] leading-none"
            >
              {formatRp(topup?.amount)}
            </p>
          </div>
          <div
            class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
          >
            <div
              class="absolute -right-3 -top-3 w-14 h-14 rounded-full bg-white/[0.03] pointer-events-none"
            ></div>
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50 mb-2"
            >
              Total Bayar
            </p>
            <p class="text-xl font-black text-white leading-none">
              {formatRp(topup?.totalAmount)}
            </p>
          </div>
        </div>

        <!-- Detail rows -->
        <div
          class="rounded-2xl border border-white/[0.07] bg-white/[0.025] divide-y divide-white/[0.06]"
        >
          <div class="flex items-center justify-between px-4 py-3 text-sm">
            <span class="text-white/50 text-xs">Metode Pembayaran</span>
            <div class="flex items-center gap-2">
              {#if topup?.paymentMethod?.thumbnail}
                <img
                  src={topup.paymentMethod.thumbnail}
                  alt={topup.paymentMethod.paymentName}
                  class="w-5 h-5 rounded object-contain"
                />
              {/if}
              <span class="font-semibold text-sm"
                >{topup?.paymentMethod?.paymentName ?? "-"}</span
              >
            </div>
          </div>
          <div class="flex items-center justify-between px-4 py-3 text-sm">
            <span class="text-white/50 text-xs">Biaya Layanan</span>
            <span class="font-semibold">{formatRp(topup?.fee ?? 0)}</span>
          </div>
          {#if expiryTime && status === "PENDING"}
            <div class="flex items-center justify-between px-4 py-3 text-sm">
              <span class="text-white/50 text-xs">Batas Waktu</span>
              <span class="font-semibold text-yellow-400 text-xs">
                {new Date(expiryTime).toLocaleString("id-ID")}
              </span>
            </div>
          {/if}
          {#if topup?.notes}
            <div class="flex items-center justify-between px-4 py-3 text-sm">
              <span class="text-white/50 text-xs">Catatan</span>
              <span class="text-white/70 text-xs italic">{topup.notes}</span>
            </div>
          {/if}
        </div>

        <!-- QRIS -->
        {#if qrString}
          <div class="mt-5">
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 mb-3"
            >
              Scan QRIS
            </p>
            <div
              class="rounded-2xl border border-white/[0.08] bg-white p-4 flex justify-center"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(qrString)}`}
                alt="QRIS Topup"
                class="w-full max-w-[260px] rounded-lg"
                width="260"
                height="260"
              />
            </div>
            <p class="text-[11px] text-white/35 text-center mt-2">
              Gunakan aplikasi dompet digital untuk scan kode di atas
            </p>
          </div>
        {/if}

        <!-- VA / Payment Code -->
        {#if vaNumber || paymentCode}
          <div class="mt-5 space-y-3">
            {#if vaNumber}
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 mb-2"
                >
                  Nomor Virtual Account
                </p>
                <button
                  onclick={() => copyToClipboard(vaNumber)}
                  class="w-full flex items-center justify-between gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] hover:border-[var(--color-primary)]/30 transition-all px-4 py-3.5 group"
                >
                  <span
                    class="font-mono text-lg font-black text-white tracking-widest"
                  >
                    {vaNumber}
                  </span>
                  <span
                    class="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-white/45 group-hover:text-[var(--color-primary)] transition-colors"
                  >
                    {#if copied}
                      <svg
                        class="w-3.5 h-3.5 text-green-400"
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
                      <span class="text-green-400">Disalin</span>
                    {:else}
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          stroke-width="2"
                        />
                        <path
                          d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                          stroke-width="2"
                        />
                      </svg>
                      Salin
                    {/if}
                  </span>
                </button>
              </div>
            {/if}
            {#if paymentCode}
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 mb-2"
                >
                  Kode Pembayaran
                </p>
                <button
                  onclick={() => copyToClipboard(paymentCode)}
                  class="w-full flex items-center justify-between gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] hover:border-[var(--color-primary)]/30 transition-all px-4 py-3.5 group"
                >
                  <span
                    class="font-mono text-lg font-black text-white tracking-widest"
                  >
                    {paymentCode}
                  </span>
                  <span
                    class="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-white/45 group-hover:text-[var(--color-primary)] transition-colors"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        stroke-width="2"
                      />
                      <path
                        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                        stroke-width="2"
                      />
                    </svg>
                    Salin
                  </span>
                </button>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Pay button -->
        {#if topup?.paymentDetails?.paymentUrl && status === "PENDING"}
          <a
            href={topup.paymentDetails.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-black font-black py-3.5 text-sm hover:brightness-110 transition-all active:scale-[0.98]"
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
                stroke-width="2.5"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Lanjut Bayar
          </a>
        {/if}
      </div>

      <!-- Footer actions -->
      <div class="border-t border-white/[0.07] px-6 py-4 flex gap-3">
        <button
          onclick={() => goto("/account")}
          class="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] py-3 text-sm font-semibold text-white/80 hover:text-white transition-all"
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Akun Saya
        </button>
        <button
          onclick={() => goto("/topup")}
          class="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/[0.08] hover:bg-[var(--color-primary)]/[0.14] py-3 text-sm font-semibold text-[var(--color-primary)] transition-all"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Topup Lagi
        </button>
      </div>
    </div>

    <!-- Trust note -->
    <p class="mt-4 text-center text-[11px] text-white/25 leading-relaxed">
      Transaksi ini diproses secara aman melalui Midtrans.<br />
      Simpan kode
      <span class="font-mono text-white/40">{topup?.topupCode}</span> sebagai bukti
      pembayaran.
    </p>
  </div>
</div>
