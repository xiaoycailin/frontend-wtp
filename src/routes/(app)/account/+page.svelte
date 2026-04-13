<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/auth";
  import { setupFetchInterceptor } from "$lib/setup/interceptor";
  import { fmt } from "$lib/components/sections/topup-components/utils";

  const { data } = $props();

  type BalanceItem = {
    type: "WALLET" | "POINTS";
    amount: string; // BigInt dari backend biasanya dikirim sebagai string
  };

  type SelfUser = {
    id: string;
    email: string;
    displayName?: string | null;
    role?: string | null;
    createdAt: string;
    userBalances?: BalanceItem[];
    // field lain kalau ada
  };

  let user = $state<SelfUser | any>(data.user);
  let transactions = $state<any[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let page = $state(1);
  let limit = $state(10);
  let total = $state(0);
  let totalPages = $state(1);

  onMount(async () => {
    setupFetchInterceptor();
    auth.init();
    if (!auth.isLoggedIn) {
      await goto("/auth/login");
      return;
    }

    await loadUser();
    await loadTransactions();
  });

  async function loadUser() {
    try {
      if (!user) {
        const u = await auth.fetchSelf();
        if (u) user = u;
      }
    } catch (e) {
      console.error(e);
      error = "Gagal memuat data pengguna";
    }
  }

  async function loadTransactions(p = page) {
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/v1/transactions/history?${params}`);
      if (!res.ok) throw new Error("Failed to load transactions");
      const json = await res.json();
      transactions = json.data?.items || [];
      total = json.data?.meta?.total || 0;
      totalPages = json.data?.meta?.totalPages || 1;
      page = p;
    } catch (e) {
      console.error(e);
      error = "Gagal memuat riwayat transaksi";
    } finally {
      loading = false;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusColor(status: string) {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500/10 text-green-300 border-green-500/30";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
      case "FAILED":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      default:
        return "bg-white/5 text-white/60 border-white/10";
    }
  }

  function getBalance(type: "WALLET" | "POINTS") {
    const bal = user?.userBalances?.find((b: BalanceItem) => b.type === type);
    return bal?.amount ?? "0";
  }

  function formatWallet() {
    const amountStr = getBalance("WALLET");
    const n = Number(amountStr);
    if (!Number.isFinite(n)) return "Rp 0";
    return n.toLocaleString("id-ID");
  }

  function formatPoints() {
    const amountStr = getBalance("POINTS");
    const n = Number(amountStr);
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("id-ID");
  }
</script>

<svelte:head>
  <title>Akun Saya - {data?.siteConfig?.siteName}</title>
</svelte:head>

<div class="min-h-screen bg-[#050505] text-white py-8 px-4 md:px-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <header class="mb-8">
      <div
        class="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <p
            class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em] mb-1"
          >
            Akun Saya
          </p>
          <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
            Profil & Riwayat Order
          </h1>
          <p class="text-xs md:text-sm text-white/50 mt-1">
            Kelola informasi akun, lihat saldo & point, serta riwayat transaksi
            Anda.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          {#if user?.role === "admin"}
            <a
              href="/admin"
              class="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-black font-semibold hover:bg-[#ffd740]"
            >
              Dashboard Admin →
            </a>
          {/if}
          <button
            on:click={() => goto("/")}
            class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </header>

    {#if error}
      <div
        class="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
      >
        {error}
      </div>
    {/if}

    <!-- User Profile + Stats -->
    {#if user}
      <div class="mb-8 grid md:grid-cols-3 gap-6">
        <!-- Profil -->
        <div
          class="md:col-span-2 bg-[#0c0c0c] border border-white/5 rounded-2xl p-5"
        >
          <h2 class="text-lg font-bold text-white mb-4">Informasi Akun</h2>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-white/50 text-xs mb-1">Nama</p>
              <p class="font-semibold">{user.displayName || "-"}</p>
            </div>
            <div>
              <p class="text-white/50 text-xs mb-1">Email</p>
              <p class="font-semibold break-all">{user.email}</p>
            </div>
            <div>
              <p class="text-white/50 text-xs mb-1">Role</p>
              <p class="font-semibold capitalize">{user.role}</p>
            </div>
            <div>
              <p class="text-white/50 text-xs mb-1">Bergabung</p>
              <p class="font-semibold">
                {new Date(user.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <!-- Statistik / T-Coins & T-Points -->
        <div
          class="relative overflow-hidden bg-[#0c0c0c] border border-white/5 rounded-2xl p-5"
        >
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,24,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_30%)] pointer-events-none"
          ></div>

          <div class="relative">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 class="text-lg font-bold text-white">T-Coins & T-Points</h2>
                <p class="text-[11px] text-white/45 mt-1">
                  Asset akun untuk pembayaran cepat dan reward loyalitas.
                </p>
              </div>

              <div
                class="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-3 py-1"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
                ></span>
                <span
                  class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]"
                >
                  Assets
                </span>
              </div>
            </div>

            <div class="space-y-3">
              <!-- T-Coins -->
              <div
                class="rounded-2xl border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/[0.06] p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p
                      class="text-[11px] uppercase tracking-[0.18em] text-[var(--color-primary)]/80 font-semibold"
                    >
                      T-Coins
                    </p>
                    <p
                      class="mt-2 text-2xl md:text-[1.7rem] leading-none font-black text-[var(--color-primary)]"
                    >
                      {formatWallet()}
                    </p>
                    <p class="mt-2 text-[11px] text-white/45">
                      Gunakan T-Coins untuk pembayaran instan dan transaksi
                      lebih cepat.
                    </p>
                  </div>

                  <div
                    class="shrink-0 w-11 h-11 rounded-2xl border border-[var(--color-primary)]/20 bg-black/20 flex items-center justify-center shadow-[0_0_0_1px_rgba(245,197,24,0.06)]"
                  >
                    <svg
                      class="w-5 h-5 text-[var(--color-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-8c1.687 0 3.13.52 3.732 1.25M12 8V6m0 10v2m-3.732-1.25C8.87 16.48 10.313 17 12 17"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- T-Points -->
              <div
                class="rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.06] p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p
                      class="text-[11px] uppercase tracking-[0.18em] text-yellow-300/90 font-semibold"
                    >
                      T-Points
                    </p>
                    <p
                      class="mt-2 text-2xl md:text-[1.7rem] leading-none font-black text-white"
                    >
                      {formatPoints()}
                      <span
                        class="ml-1 text-xs font-semibold text-yellow-300/80"
                      >
                        pts
                      </span>
                    </p>
                    <p class="mt-2 text-[11px] text-white/45">
                      Kumpulkan T-Points dari aktivitas dan tukarkan ke benefit
                      tertentu.
                    </p>
                  </div>

                  <div
                    class="shrink-0 w-11 h-11 rounded-2xl border border-yellow-400/20 bg-black/20 flex items-center justify-center shadow-[0_0_0_1px_rgba(250,204,21,0.06)]"
                  >
                    <svg
                      class="w-5 h-5 text-yellow-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.889a1 1 0 00-.364 1.118l1.519 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.889a1 1 0 00-1.176 0l-3.976 2.889c-.783.57-1.838-.197-1.539-1.118l1.52-4.674a1 1 0 00-.364-1.118L2.176 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.52-4.674z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-white/5">
              <p class="text-[11px] leading-relaxed text-white/40">
                T-Coins dipakai sebagai saldo utama akun, sedangkan T-Points
                adalah reward loyalitas yang bisa dikumpulkan dari aktivitas
                tertentu.
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Transactions Section -->
    <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden">
      <div
        class="px-5 py-4 border-b border-white/5 flex items-center justify-between"
      >
        <h2 class="text-lg font-bold text-white">Riwayat Transaksi</h2>
        <div class="text-xs text-white/50">
          Halaman {page} dari {totalPages}
        </div>
      </div>

      {#if loading}
        <div class="p-8 text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent"
          ></div>
          <p class="text-white/50 mt-2">Memuat riwayat...</p>
        </div>
      {:else if transactions.length === 0}
        <div class="p-8 text-center">
          <svg
            class="w-12 h-12 mx-auto text-white/20 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <p class="text-white/50">Belum ada transaksi.</p>
          <button
            on:click={() => goto("/")}
            class="mt-3 px-4 py-2 text-sm bg-[var(--color-primary)] text-black font-semibold rounded-lg"
          >
            Mulai Belanja
          </button>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-white/5">
              <tr>
                <th class="px-4 py-3 font-semibold text-white/60">
                  ID Transaksi
                </th>
                <th class="px-4 py-3 font-semibold text-white/60">Produk</th>
                <th class="px-4 py-3 font-semibold text-white/60">Total</th>
                <th class="px-4 py-3 font-semibold text-white/60">
                  Status Pembayaran
                </th>
                <th class="px-4 py-3 font-semibold text-white/60">
                  Status Order
                </th>
                <th class="px-4 py-3 font-semibold text-white/60">Tanggal</th>
                <th class="px-4 py-3 font-semibold text-white/60 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {#each transactions as tx}
                <tr class="border-t border-white/5 hover:bg-white/[0.03]">
                  <td class="px-4 py-3 align-top">
                    <p class="font-mono text-xs text-white/80">{tx.trxId}</p>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <div class="flex items-center gap-2">
                      {#if tx.product?.thumbnails}
                        <img
                          src={tx.product.thumbnails}
                          alt={tx.product.title}
                          class="w-8 h-8 rounded object-cover"
                        />
                      {/if}
                      <div>
                        <p class="font-semibold text-white text-sm">
                          {tx.product?.title || "-"}
                        </p>
                        <p class="text-xs text-white/50">
                          quantity: {tx?.quantity || "0"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 align-top font-semibold text-white">
                    {fmt(tx.price)}
                  </td>
                  <td class="px-4 py-3 align-top">
                    <span
                      class={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${statusColor(
                        tx.paymentStatus,
                      )}`}
                    >
                      {tx.paymentStatus}
                    </span>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <span
                      class={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${statusColor(
                        tx.orderStatus,
                      )}`}
                    >
                      {tx.orderStatus}
                    </span>
                  </td>
                  <td class="px-4 py-3 align-top text-white/70 text-sm">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td class="px-4 py-3 align-top text-right">
                    <a
                      href="/invoice/{tx.trxId}"
                      class="inline-block px-3 py-1.5 text-xs font-semibold bg-white/5 text-white/80 border border-white/10 rounded-lg hover:bg-white/10"
                    >
                      Lihat Invoice
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        {#if totalPages > 1}
          <div
            class="px-5 py-4 border-t border-white/5 flex items-center justify-between text-sm"
          >
            <div class="text-white/50">
              Menampilkan {transactions.length} dari {total} transaksi
            </div>
            <div class="flex items-center gap-1">
              <button
                on:click={() => loadTransactions(page - 1)}
                disabled={page <= 1}
                class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>
              {#each { length: totalPages } as _, i}
                {@const p = i + 1}
                <button
                  on:click={() => loadTransactions(p)}
                  class={`px-3 py-1.5 rounded-lg border ${
                    p === page
                      ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)]"
                      : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              {/each}
              <button
                on:click={() => loadTransactions(page + 1)}
                disabled={page >= totalPages}
                class="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>
