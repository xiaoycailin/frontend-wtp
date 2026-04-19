<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/auth";
  import { setupFetchInterceptor } from "$lib/setup/interceptor";
  import { fmt } from "$lib/components/sections/topup-components/utils";
  import { navState } from "$lib/stores/navigation";
  import BottomNavigation from "$lib/components/BottomNavigation.svelte";

  const { data } = $props();

  type BalanceItem = { type: "WALLET" | "POINTS"; amount: string };
  type BalanceEntry = {
    id: number;
    entryType: "WALLET" | "POINTS";
    amount: string;
    ref?: string | null;
    createdAt: string;
    meta?: { productName?: string; reason?: string; [key: string]: any };
  };
  type SelfUser = {
    id: string;
    email: string;
    displayName?: string | null;
    role?: string | null;
    createdAt: string;
    userBalances?: BalanceItem[];
  };

  let user = $state<SelfUser | null>(data.user ?? null);
  let transactions = $state<any[]>([]);
  let balanceTopups = $state<any[]>([]);
  let balanceEntries = $state<BalanceEntry[]>([]);
  let mounted = $state(false);

  let topupPage = $state(1);
  const topupLimit = 6;
  let topupMeta = $state({ total: 0, page: 1, limit: 6, totalPages: 1 });

  let balancePage = $state(1);
  const balanceLimit = 8;
  let balanceMeta = $state({ total: 0, page: 1, limit: 8, totalPages: 1 });

  let page = $state(1);
  const limit = 10;
  let total = $state(0);
  let totalPages = $state(1);

  let loading = $state(true);
  let loadingTopup = $state(false);
  let loadingBalance = $state(false);
  let error = $state<string | null>(null);

  // Active tab untuk mobile history section
  let activeHistoryTab = $state<"topup" | "balance">("topup");

  onMount(async () => {
    setupFetchInterceptor();
    auth.init();
    if (!auth.isLoggedIn) {
      await goto("/auth/login");
      return;
    }
    await loadUser();
    await Promise.all([
      loadTransactions(),
      loadBalanceTopups(),
      loadBalanceHistory(),
    ]);
    setTimeout(() => (mounted = true), 60);
  });

  async function loadUser() {
    try {
      if (!user) {
        const u = await auth.fetchSelf();
        if (u) user = u as any;
      }
    } catch {
      error = "Gagal memuat data pengguna";
    }
  }

  async function loadTransactions(p = page) {
    loading = true;
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/v1/transactions/history?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      transactions = json.data?.items ?? [];
      total = json.data?.meta?.total ?? 0;
      totalPages = json.data?.meta?.totalPages ?? 1;
      page = p;
    } catch {
      error = "Gagal memuat riwayat transaksi";
    } finally {
      loading = false;
    }
  }

  async function loadBalanceTopups(p = topupPage) {
    loadingTopup = true;
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: topupLimit.toString(),
      });
      const res = await fetch(`/api/v1/users/balance-topups?${params}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      balanceTopups = json?.data?.items ?? [];
      topupMeta = json?.data?.meta ?? topupMeta;
      topupPage = p;
    } catch {
    } finally {
      loadingTopup = false;
    }
  }

  async function loadBalanceHistory(p = balancePage) {
    loadingBalance = true;
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: balanceLimit.toString(),
      });
      const res = await fetch(`/api/v1/users/balance-history?${params}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      balanceEntries = json?.data?.items ?? json?.items ?? [];
      balanceMeta = json?.data?.meta ?? json?.meta ?? balanceMeta;
      balancePage = p;
    } catch {
    } finally {
      loadingBalance = false;
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusColor(s: string | null | undefined) {
    switch (s) {
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
      case "FAILED":
        return "bg-red-500/10 text-red-400 border-red-500/25";
      default:
        return "bg-white/5 text-white/50 border-white/10";
    }
  }

  function statusDot(s: string | null | undefined) {
    switch (s) {
      case "SUCCESS":
        return "bg-emerald-400";
      case "PENDING":
        return "bg-yellow-400 animate-pulse";
      case "FAILED":
        return "bg-red-400";
      default:
        return "bg-white/30";
    }
  }

  function getBalance(type: "WALLET" | "POINTS") {
    return user?.userBalances?.find((b) => b.type === type)?.amount ?? "0";
  }
  function formatWallet() {
    const n = Number(getBalance("WALLET"));
    return Number.isFinite(n) ? n.toLocaleString("id-ID") : "0";
  }
  function formatPoints() {
    const n = Number(getBalance("POINTS"));
    return Number.isFinite(n) ? n.toLocaleString("id-ID") : "0";
  }
  function getEntryLabel(entry: BalanceEntry): string {
    if (entry.meta?.productName) return entry.meta.productName;
    if (entry.meta?.reason) return entry.meta.reason.replace(/_/g, " ");
    return entry.ref ?? "-";
  }
  function getPaginationRange(
    current: number,
    total: number,
  ): (number | "...")[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const range: (number | "...")[] = [];
    if (current <= 3) {
      range.push(1, 2, 3, "...", total);
    } else if (current >= total - 2) {
      range.push(1, "...", total - 2, total - 1, total);
    } else {
      range.push(1, "...", current, "...", total);
    }
    return range;
  }

  // Avatar initials
  function getInitials(name?: string | null, email?: string) {
    if (name) return name.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
  }

  function scrollToElement(id: string, offset: number = 80) {
    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
  navState.subscribe((value) => {
    if (value.from == "wallet" || value.from == "navbottom") {
      if (value.data.tab == "history") {
        setTimeout(() => {
          scrollToElement("history-section", 80);
        }, 100); // delay kecil biar DOM sudah render
      }
      if (value.data.tab == "transactions") {
        setTimeout(() => {
          scrollToElement("transactions", 80);
        }, 100); // delay kecil biar DOM sudah render
      }
    }
  });
</script>

<svelte:head>
  <title>Akun Saya — {data?.siteConfig?.siteName ?? "Topupin"}</title>
</svelte:head>

<div class="text-white">
  <!-- Ambient -->
  <div
    class="pointer-events-none fixed inset-0 overflow-hidden"
    aria-hidden="true"
  >
    <div
      class="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-[0.03]"
      style="background: radial-gradient(ellipse, #f5c518 0%, transparent 65%);"
    ></div>
  </div>

  <div
    class="relative mx-auto px-4 md:px-6 py-8 transition-all duration-500"
    class:opacity-0={!mounted}
    class:opacity-100={mounted}
  >
    <!-- ── PAGE HEADER ── -->
    <header class="mb-8 flex items-start justify-between gap-4">
      <div>
        <p
          class="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)] mb-2"
        >
          Akun Saya
        </p>
        <h1 class="text-2xl md:text-3xl font-black leading-tight">
          Profil & Riwayat
        </h1>
        <p class="text-sm text-white/40 mt-1">
          Kelola akun, saldo, dan semua transaksimu.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        {#if user?.role === "admin"}
          <a
            href="/admin"
            class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black hover:brightness-110 transition-all"
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
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
              />
            </svg>
            Admin
          </a>
        {/if}
        <button
          onclick={() => goto("/")}
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all"
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
          <span class="hidden sm:inline">Beranda</span>
        </button>
      </div>
    </header>

    {#if error}
      <div
        class="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/8 border border-red-500/20 text-red-300 text-sm"
      >
        <svg
          class="w-4 h-4 shrink-0"
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
        {error}
      </div>
    {/if}

    <!-- ── TOP SECTION: Profile + Assets ── -->
    {#if user}
      <div class="grid md:grid-cols-5 gap-4 mb-6">
        <!-- Profile card -->
        <div
          class="md:col-span-3 rounded-3xl border border-white/[0.07] bg-[#0d0d0d] overflow-hidden"
        >
          <!-- Card top strip -->
          <div
            class="h-20 relative"
            style="background: linear-gradient(135deg, rgba(245,197,24,0.12) 0%, rgba(255,255,255,0.02) 100%);"
          >
            <div
              class="absolute inset-0"
              style="background: repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.012) 20px, rgba(255,255,255,0.012) 21px);"
            ></div>
          </div>

          <div class="px-5 pb-5 -mt-8 relative">
            <!-- Avatar -->
            <div class="flex items-end justify-between mb-4">
              <div
                class="w-16 h-16 rounded-2xl border-4 border-[#0d0d0d] flex items-center justify-center text-xl font-black"
                style="background: linear-gradient(135deg, #f5c518, #fbbf24);"
              >
                <span class="text-black"
                  >{getInitials(user.displayName, user.email)}</span
                >
              </div>
              {#if user.role === "admin"}
                <span
                  class="mb-1 px-2.5 py-1 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/25 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-wider"
                >
                  Admin
                </span>
              {/if}
            </div>

            <h2 class="text-lg font-black text-white">
              {user.displayName || "Pengguna"}
            </h2>
            <p class="text-sm text-white/45 mt-0.5 break-all">{user.email}</p>

            <div
              class="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-sm"
            >
              <div>
                <p
                  class="text-[10px] font-semibold text-white/35 uppercase tracking-[0.14em] mb-1"
                >
                  Role
                </p>
                <p class="font-semibold capitalize text-white/80">
                  {user.role ?? "User"}
                </p>
              </div>
              <div>
                <p
                  class="text-[10px] font-semibold text-white/35 uppercase tracking-[0.14em] mb-1"
                >
                  Bergabung
                </p>
                <p class="font-semibold text-white/80">
                  {new Date(user.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Assets: T-Coins + T-Points stacked -->
        <div class="md:col-span-2 flex flex-col gap-4">
          <!-- T-Coins -->
          <div
            class="flex-1 relative overflow-hidden rounded-3xl border border-[var(--color-primary)]/20 bg-[#0d0d0d]"
          >
            <div
              class="absolute inset-0 pointer-events-none"
              style="background: radial-gradient(ellipse at top right, rgba(245,197,24,0.1) 0%, transparent 55%);"
            ></div>
            <div class="relative p-5">
              <div class="flex items-center justify-between mb-3">
                <span
                  class="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]/80"
                  >T-Coins</span
                >
                <div
                  class="w-8 h-8 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-[var(--color-primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-8c1.687 0 3.13.52 3.732 1.25M12 8V6m0 10v2"
                    />
                  </svg>
                </div>
              </div>
              <p
                class="text-3xl font-black text-[var(--color-primary)] leading-none"
              >
                {formatWallet()}
              </p>
              <p class="text-[11px] text-white/35 mt-2">
                Saldo untuk pembayaran instan
              </p>
              <a
                href="/topup"
                class="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black hover:brightness-110 transition-all active:scale-[0.98]"
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
                    stroke-width="3"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Topup Sekarang
              </a>
            </div>
          </div>

          <!-- T-Points -->
          <div
            class="flex-1 relative overflow-hidden rounded-3xl border border-yellow-400/15 bg-[#0d0d0d]"
          >
            <div
              class="absolute inset-0 pointer-events-none"
              style="background: radial-gradient(ellipse at bottom left, rgba(251,191,36,0.07) 0%, transparent 55%);"
            ></div>
            <div class="relative p-5">
              <div class="flex items-center justify-between mb-3">
                <span
                  class="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-400/80"
                  >T-Points</span
                >
                <div
                  class="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-yellow-400"
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
              <p class="text-3xl font-black text-white leading-none">
                {formatPoints()}
                <span class="text-sm font-bold text-yellow-400/70 ml-1"
                  >pts</span
                >
              </p>
              <p class="text-[11px] text-white/35 mt-2">
                Reward dari setiap transaksi
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- ── HISTORY: Topup & Balance (tabbed on mobile, side-by-side on desktop) ── -->
    <div id="history-section" class="mb-6">
      <!-- Mobile tab switcher -->
      <div
        class="flex sm:hidden items-center gap-0 mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.07] p-1"
      >
        <button
          onclick={() => (activeHistoryTab = "topup")}
          class="flex-1 py-2 rounded-xl text-xs font-bold transition-all {activeHistoryTab ===
          'topup'
            ? 'bg-[var(--color-primary)] text-black'
            : 'text-white/50'}"
        >
          Riwayat Topup
        </button>
        <button
          onclick={() => (activeHistoryTab = "balance")}
          class="flex-1 py-2 rounded-xl text-xs font-bold transition-all {activeHistoryTab ===
          'balance'
            ? 'bg-[var(--color-primary)] text-black'
            : 'text-white/50'}"
        >
          Riwayat Balance
        </button>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <!-- Riwayat Topup -->
        <section
          class="rounded-3xl border border-white/[0.07] bg-[#0d0d0d] flex flex-col overflow-hidden {activeHistoryTab !==
          'topup'
            ? 'hidden sm:flex'
            : 'flex'}"
        >
          <div
            class="px-5 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between gap-3"
          >
            <div>
              <h2 class="text-sm font-bold text-white">Riwayat Topup</h2>
              <p class="text-[11px] text-white/35 mt-0.5">
                Pengisian saldo T-Coins
              </p>
            </div>
            <a
              href="/topup"
              class="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-black text-[11px] font-black hover:brightness-110 transition-all"
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
                  stroke-width="3"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Topup
            </a>
          </div>

          <div class="flex-1 p-4">
            {#if loadingTopup}
              <div class="flex items-center justify-center py-10">
                <div
                  class="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"
                ></div>
              </div>
            {:else if balanceTopups.length === 0}
              <div
                class="flex flex-col items-center justify-center py-10 text-center"
              >
                <div
                  class="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-3"
                >
                  <svg
                    class="w-5 h-5 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-8V6m0 10v2"
                    />
                  </svg>
                </div>
                <p class="text-sm text-white/40">Belum ada topup</p>
                <a
                  href="/topup"
                  class="mt-2 text-xs text-[var(--color-primary)] font-semibold"
                  >Topup pertama →</a
                >
              </div>
            {:else}
              <div class="space-y-2">
                {#each balanceTopups as topup (topup.id)}
                  <a
                    href={`/topup/invoice/${topup.topupCode}`}
                    class="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/[0.04] transition-all group"
                  >
                    <!-- Method thumbnail -->
                    {#if topup.paymentMethod?.thumbnail}
                      <div
                        class="w-9 h-9 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={topup.paymentMethod.thumbnail}
                          alt={topup.paymentMethod.paymentName}
                          class="w-full h-full object-contain"
                        />
                      </div>
                    {:else}
                      <div
                        class="w-9 h-9 rounded-xl bg-white/5 shrink-0 flex items-center justify-center"
                      >
                        <svg
                          class="w-4 h-4 text-white/30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                    {/if}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p
                          class="text-xs font-bold text-white font-mono truncate"
                        >
                          {topup.topupCode}
                        </p>
                      </div>
                      <p class="text-[10px] text-white/35 mt-0.5 truncate">
                        {formatDate(topup.createdAt)} • {topup.paymentMethod
                          ?.paymentName ?? "-"}
                      </p>
                    </div>
                    <div class="shrink-0 text-right">
                      <p class="text-sm font-black text-[var(--color-primary)]">
                        Rp {Number(topup.amount).toLocaleString("id-ID")}
                      </p>
                      <span
                        class={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-1 ${statusColor(topup.paymentStatus)}`}
                      >
                        <span
                          class={`w-1.5 h-1.5 rounded-full ${statusDot(topup.paymentStatus)}`}
                        ></span>
                        {topup.paymentStatus}
                      </span>
                    </div>
                  </a>
                {/each}
              </div>
            {/if}
          </div>

          {#if topupMeta.totalPages > 1}
            <div
              class="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between gap-2"
            >
              <span class="text-[10px] text-white/30"
                >{topupMeta.page}/{topupMeta.totalPages}</span
              >
              <div class="flex items-center gap-1">
                <button
                  onclick={() => loadBalanceTopups(topupPage - 1)}
                  disabled={topupPage <= 1 || loadingTopup}
                  class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 text-xs flex items-center justify-center transition-colors"
                  >←</button
                >
                {#each getPaginationRange(topupPage, topupMeta.totalPages) as p}
                  {#if p === "..."}
                    <span class="text-white/25 text-xs px-1">…</span>
                  {:else}
                    <button
                      onclick={() => loadBalanceTopups(p)}
                      class="w-7 h-7 rounded-lg border text-xs font-bold transition-colors {p ===
                      topupPage
                        ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)]'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}"
                      >{p}</button
                    >
                  {/if}
                {/each}
                <button
                  onclick={() => loadBalanceTopups(topupPage + 1)}
                  disabled={topupPage >= topupMeta.totalPages || loadingTopup}
                  class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 text-xs flex items-center justify-center transition-colors"
                  >→</button
                >
              </div>
            </div>
          {/if}
        </section>

        <!-- Riwayat Balance -->
        <section
          class="rounded-3xl border border-white/[0.07] bg-[#0d0d0d] flex flex-col overflow-hidden {activeHistoryTab !==
          'balance'
            ? 'hidden sm:flex'
            : 'flex'}"
        >
          <div class="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <h2 class="text-sm font-bold text-white">Riwayat Balance</h2>
            <p class="text-[11px] text-white/35 mt-0.5">
              Kredit & debit T-Coins / T-Points
            </p>
          </div>

          <div class="flex-1 p-4">
            {#if loadingBalance}
              <div class="flex items-center justify-center py-10">
                <div
                  class="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"
                ></div>
              </div>
            {:else if balanceEntries.length === 0}
              <div
                class="flex flex-col items-center justify-center py-10 text-center"
              >
                <div
                  class="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-3"
                >
                  <svg
                    class="w-5 h-5 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p class="text-sm text-white/40">Belum ada pergerakan saldo</p>
              </div>
            {:else}
              <div class="space-y-2">
                {#each balanceEntries as entry (entry.id)}
                  {@const isWallet = entry.entryType === "WALLET"}
                  {@const amount = Number(entry.amount)}
                  {@const isPositive = amount > 0}
                  <div
                    class="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                  >
                    <!-- Icon -->
                    <div
                      class="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center {isPositive
                        ? 'bg-emerald-500/10'
                        : 'bg-white/5'}"
                    >
                      <svg
                        class="w-4 h-4 {isPositive
                          ? 'text-emerald-400'
                          : 'text-white/40'}"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {#if isPositive}
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        {:else}
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        {/if}
                      </svg>
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-white truncate">
                        {getEntryLabel(entry)}
                      </p>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span
                          class={`text-[9px] font-bold px-1 py-0.5 rounded-full border ${
                            isWallet
                              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20"
                              : "bg-sky-400/10 text-sky-300 border-sky-400/20"
                          }`}>{isWallet ? "T-Coins" : "T-Points"}</span
                        >
                        <span class="text-[10px] text-white/30"
                          >{formatDate(entry.createdAt)}</span
                        >
                      </div>
                    </div>

                    <span
                      class={`shrink-0 text-sm font-black tabular-nums ${
                        isPositive
                          ? isWallet
                            ? "text-[var(--color-primary)]"
                            : "text-sky-300"
                          : "text-white/55"
                      }`}
                    >
                      {isPositive ? "+" : ""}{amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          {#if balanceMeta.totalPages > 1}
            <div
              class="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between gap-2"
            >
              <span class="text-[10px] text-white/30"
                >{balanceMeta.page}/{balanceMeta.totalPages}</span
              >
              <div class="flex items-center gap-1">
                <button
                  onclick={() => loadBalanceHistory(balancePage - 1)}
                  disabled={balancePage <= 1 || loadingBalance}
                  class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 text-xs flex items-center justify-center transition-colors"
                  >←</button
                >
                {#each getPaginationRange(balancePage, balanceMeta.totalPages) as p}
                  {#if p === "..."}
                    <span class="text-white/25 text-xs px-1">…</span>
                  {:else}
                    <button
                      onclick={() => loadBalanceHistory(p)}
                      class="w-7 h-7 rounded-lg border text-xs font-bold transition-colors {p ===
                      balancePage
                        ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)]'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}"
                      >{p}</button
                    >
                  {/if}
                {/each}
                <button
                  onclick={() => loadBalanceHistory(balancePage + 1)}
                  disabled={balancePage >= balanceMeta.totalPages ||
                    loadingBalance}
                  class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 text-xs flex items-center justify-center transition-colors"
                  >→</button
                >
              </div>
            </div>
          {/if}
        </section>
      </div>
    </div>

    <!-- ── RIWAYAT TRANSAKSI ── -->
    <section
      id="transactions"
      class="rounded-3xl border border-white/[0.07] bg-[#0d0d0d] overflow-hidden"
    >
      <div
        class="px-5 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between gap-3"
      >
        <div>
          <h2 class="text-sm font-bold text-white">Riwayat Transaksi</h2>
          <p class="text-[11px] text-white/35 mt-0.5">
            {total > 0
              ? `${total} total transaksi`
              : "Semua riwayat order kamu"}
          </p>
        </div>
        {#if !loading && transactions.length > 0}
          <span class="text-[10px] text-white/30">Hal. {page}/{totalPages}</span
          >
        {/if}
      </div>

      {#if loading}
        <div class="flex flex-col items-center justify-center py-16">
          <div
            class="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin mb-4"
          ></div>
          <p class="text-sm text-white/35">Memuat transaksi...</p>
        </div>
      {:else if transactions.length === 0}
        <div
          class="flex flex-col items-center justify-center py-16 text-center px-6"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4"
          >
            <svg
              class="w-7 h-7 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p class="text-white/50 text-sm mb-1">Belum ada transaksi</p>
          <p class="text-white/30 text-xs mb-4">
            Mulai topup dan order produk pertamamu!
          </p>
          <button
            onclick={() => goto("/")}
            class="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black hover:brightness-110 transition-all"
          >
            Jelajahi Produk →
          </button>
        </div>
      {:else}
        <!-- Mobile: card list -->
        <div class="md:hidden divide-y divide-white/[0.05]">
          {#each transactions as tx (tx.trxId)}
            <div class="p-4 space-y-3">
              <div class="flex items-start gap-3">
                {#if tx.product?.thumbnails}
                  <img
                    src={tx.product.thumbnails}
                    alt={tx.product.title}
                    width="44"
                    height="44"
                    class="w-11 h-11 rounded-xl object-cover shrink-0"
                    loading="lazy"
                  />
                {:else}
                  <div
                    class="w-11 h-11 rounded-xl bg-white/5 shrink-0 flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-white/20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                {/if}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-white truncate">
                    {tx.product?.title || "-"}
                  </p>
                  <p class="text-[11px] text-white/40 mt-0.5 font-mono">
                    {tx.trxId}
                  </p>
                  <p class="text-[11px] text-white/35 mt-0.5">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
                <div class="shrink-0 text-right">
                  <p class="text-sm font-black text-white">{fmt(tx.price)}</p>
                  <p class="text-[10px] text-white/40 mt-0.5">
                    Qty: {tx?.quantity ?? 1}
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span
                    class={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(tx.paymentStatus)}`}
                  >
                    <span
                      class={`w-1.5 h-1.5 rounded-full ${statusDot(tx.paymentStatus)}`}
                    ></span>
                    {tx.paymentStatus ?? "-"}
                  </span>
                  <span
                    class={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(tx.orderStatus)}`}
                  >
                    <span
                      class={`w-1.5 h-1.5 rounded-full ${statusDot(tx.orderStatus)}`}
                    ></span>
                    {tx.orderStatus ?? "-"}
                  </span>
                </div>
                <a
                  href="/invoice/{tx.trxId}"
                  class="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Invoice →
                </a>
              </div>
            </div>
          {/each}
        </div>

        <!-- Desktop: table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="bg-white/[0.025]">
                {#each ["Transaksi", "Produk", "Total", "Pembayaran", "Order", "Tanggal", ""] as h}
                  <th
                    class="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 whitespace-nowrap"
                    >{h}</th
                  >
                {/each}
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              {#each transactions as tx (tx.trxId)}
                <tr class="hover:bg-white/[0.025] transition-colors">
                  <td class="px-4 py-3.5 align-middle">
                    <p
                      class="font-mono text-xs text-white/70 whitespace-nowrap"
                    >
                      {tx.trxId}
                    </p>
                    {#if tx.promo?.promotionCode}
                      <span
                        class="mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/20"
                      >
                        🏷 {tx.promo.promotionCode}
                      </span>
                    {/if}
                  </td>
                  <td class="px-4 py-3.5 align-middle">
                    <div class="flex items-center gap-2.5">
                      {#if tx.product?.thumbnails}
                        <img
                          src={tx.product.thumbnails}
                          alt={tx.product.title}
                          width="36"
                          height="36"
                          class="w-9 h-9 rounded-xl object-cover shrink-0"
                          loading="lazy"
                        />
                      {/if}
                      <div class="min-w-0">
                        <p
                          class="font-semibold text-white truncate max-w-[150px]"
                        >
                          {tx.product?.title || "-"}
                        </p>
                        <p class="text-[11px] text-white/40">
                          Qty: {tx?.quantity ?? 1}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    class="px-4 py-3.5 align-middle font-black text-white whitespace-nowrap tabular-nums"
                  >
                    {fmt(tx.price)}
                  </td>
                  <td class="px-4 py-3.5 align-middle">
                    <span
                      class={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${statusColor(tx.paymentStatus)}`}
                    >
                      <span
                        class={`w-1.5 h-1.5 rounded-full ${statusDot(tx.paymentStatus)}`}
                      ></span>
                      {tx.paymentStatus ?? "-"}
                    </span>
                  </td>
                  <td class="px-4 py-3.5 align-middle">
                    <span
                      class={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${statusColor(tx.orderStatus)}`}
                    >
                      <span
                        class={`w-1.5 h-1.5 rounded-full ${statusDot(tx.orderStatus)}`}
                      ></span>
                      {tx.orderStatus ?? "-"}
                    </span>
                  </td>
                  <td
                    class="px-4 py-3.5 align-middle text-white/45 text-xs whitespace-nowrap"
                  >
                    {formatDate(tx.createdAt)}
                  </td>
                  <td class="px-4 py-3.5 align-middle text-right">
                    <a
                      href="/invoice/{tx.trxId}"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 text-[11px] font-semibold hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
                    >
                      Invoice
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Pagination transaksi -->
        {#if totalPages > 1}
          <div
            class="px-5 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <p class="text-[11px] text-white/35">
              {transactions.length} dari {total} transaksi
            </p>
            <div class="flex items-center gap-1">
              <button
                onclick={() => loadTransactions(page - 1)}
                disabled={page <= 1}
                class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center transition-colors"
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
              </button>
              {#each getPaginationRange(page, totalPages) as p}
                {#if p === "..."}
                  <span class="w-8 text-center text-white/25 text-xs">…</span>
                {:else}
                  <button
                    onclick={() => loadTransactions(p)}
                    class="w-8 h-8 rounded-xl border text-xs font-bold transition-colors {p ===
                    page
                      ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)]'
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}"
                    >{p}</button
                  >
                {/if}
              {/each}
              <button
                onclick={() => loadTransactions(page + 1)}
                disabled={page >= totalPages}
                class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center transition-colors"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        {/if}
      {/if}
    </section>
  </div>
</div>

<BottomNavigation />
