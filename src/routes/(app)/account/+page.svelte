<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/auth";
  import { setupFetchInterceptor } from "$lib/setup/interceptor";

  let user = $state<any>(null);
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
      const res = await fetch("/api/v1/users/self");
      if (!res.ok) throw new Error("Failed to load user");
      const json = await res.json();
      user = json.data;
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

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
</script>

<svelte:head>
  <title>Akun Saya - WTPANJAY</title>
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
            Kelola informasi akun dan lihat riwayat transaksi Anda.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <!-- TAMBAH: tombol admin jika role admin -->
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

    <!-- User Profile Card -->
    {#if user}
      <div class="mb-8 grid md:grid-cols-3 gap-6">
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
              <p class="font-semibold">{user.email}</p>
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
        <div class="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5">
          <h2 class="text-lg font-bold text-white mb-4">Statistik</h2>
          <div class="space-y-3">
            <div>
              <p class="text-white/50 text-xs mb-1">Total Transaksi</p>
              <p class="text-2xl font-black text-[var(--color-primary)]">
                {total}
              </p>
            </div>
            <div>
              <p class="text-white/50 text-xs mb-1">Saldo (jika ada)</p>
              <p class="text-xl font-semibold text-white">-</p>
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
                <th class="px-4 py-3 font-semibold text-white/60"
                  >ID Transaksi</th
                >
                <th class="px-4 py-3 font-semibold text-white/60">Produk</th>
                <th class="px-4 py-3 font-semibold text-white/60">Total</th>
                <th class="px-4 py-3 font-semibold text-white/60"
                  >Status Pembayaran</th
                >
                <th class="px-4 py-3 font-semibold text-white/60"
                  >Status Order</th
                >
                <th class="px-4 py-3 font-semibold text-white/60">Tanggal</th>
                <th class="px-4 py-3 font-semibold text-white/60 text-right"
                  >Aksi</th
                >
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
                    {formatCurrency(tx.price)}
                  </td>
                  <td class="px-4 py-3 align-top">
                    <span
                      class={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${statusColor(tx.paymentStatus)}`}
                    >
                      {tx.paymentStatus}
                    </span>
                  </td>
                  <td class="px-4 py-3 align-top">
                    <span
                      class={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${statusColor(tx.orderStatus)}`}
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

        <!-- Pagination -->
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
                  class={`px-3 py-1.5 rounded-lg border ${p === page ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)]" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"}`}
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
