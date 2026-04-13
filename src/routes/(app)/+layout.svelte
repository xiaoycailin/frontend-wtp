<script lang="ts">
  import { onMount, setContext } from "svelte";
  import "../layout.css";

  import {
    Basket,
    MenuSearch,
    TrophyStar,
    Newspaper,
    User,
    ShoppingBag,
  } from "@boxicons/svelte";
  import { page } from "$app/stores";
  import { auth } from "$lib/auth";

  import SeoHead from "$lib/components/SeoHead.svelte";
  import { setupFetchInterceptor } from "$lib/setup/interceptor.js";
  import { goto } from "$app/navigation";
  import Index from "$lib/components/Toast/index.svelte";

  let { children, data } = $props();

  // user dari load (sudah include balances)
  type BalanceItem = {
    type: "WALLET" | "POINTS";
    amount: string; // BigInt as string
  };

  let userData = $state<any>(data.user ?? null);

  let siteConfig = data?.siteConfig ?? {};
  const primaryColor = siteConfig?.primaryColor ?? "#f5c518";
  const secondaryColor = siteConfig?.secondaryColor ?? "#0e0e0e";
  const accentColor = siteConfig?.accentColor ?? "#ffffff";

  let mobileMenuOpen = $state(false);
  let searchQuery = $state("");

  // state lokal auth
  let isLoggedIn = $state(data.token !== null);
  let displayName = $state<string | null>(data?.user?.displayName);

  setContext("sch_query", {
    get value() {
      return searchQuery;
    },
    set value(v) {
      searchQuery = v;
    },
  });
  setContext("site_config", {
    get value() {
      return siteConfig;
    },
    set value(v) {
      siteConfig = v;
    },
  });

  // navItems reaktif ke isLoggedIn
  const navItems = $derived(() => {
    const items = [
      { label: "Topup", href: "/", icon: Basket },
      { label: "Produk", href: "/products", icon: ShoppingBag },
      { label: "Cek Transaksi", href: "/invoice", icon: MenuSearch },
      { label: "Leaderboard", href: "/leaderboard", icon: TrophyStar },
      { label: "Artikel", href: "/article", icon: Newspaper },
    ];

    if (isLoggedIn) {
      items.push({
        label: "Akun Saya",
        href: "/account",
        icon: User,
      });
    }

    return items;
  });

  function isActive(href: string, pathname: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  onMount(() => {
    auth.init();
    setupFetchInterceptor();
  });

  // sinkronkan dengan auth (sesuaikan dengan struktur auth-mu)
  $effect(() => {
    isLoggedIn = auth.isLoggedIn ?? data.token != null;
    displayName = auth.user?.displayName ?? auth.user?.email ?? null;
  });

  function handleLogout() {
    auth.logout?.();
    goto("/");
  }

  // ----- helper saldo & poin dari data.user -----
  function getBalance(type: "WALLET" | "POINTS") {
    const bal = userData?.userBalances?.find(
      (b: BalanceItem) => b.type === type,
    );
    return bal?.amount ?? "0";
  }

  function formatWallet() {
    const s = getBalance("WALLET");
    const n = Number(s);
    if (!Number.isFinite(n)) return "Rp 0";
    return "Rp " + n.toLocaleString("id-ID");
  }

  function formatPoints() {
    const s = getBalance("POINTS");
    const n = Number(s);
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("id-ID");
  }
</script>

<SeoHead {siteConfig} />
<Index />
<div
  style="--color-primary: {primaryColor}; --color-secondary: {secondaryColor}; --color-accent: {accentColor};"
  class="min-h-screen bg-[#1a1a1a] text-white font-sans flex flex-col"
>
  <!-- NAVBAR -->
  <header
    class="sticky top-0 z-50 bg-[#111111]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/40"
  >
    <!-- Top Bar -->
    <div
      class="mx-auto max-w-[1400px] justify-between w-full px-5 md:px-8 flex items-center gap-3 h-14 md:h-16"
    >
      <!-- Logo -->
      <a href="/" class="shrink-0 flex items-center gap-2 mr-2">
        {#if siteConfig?.logoUrl}
          <img src={siteConfig.logoUrl} width="50" alt="" />
        {:else}
          <div
            class="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-black font-black"
          >
            W
          </div>
        {/if}
      </a>

      <!-- Search Bar -->
      <div class="flex-1 relative max-w-xl">
        <div
          class="absolute inset-y-0 left-3 flex items-center pointer-events-none"
        >
          <svg
            class="w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari Game atau Voucher"
          class="w-full bg-white/8 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm
           text-white placeholder-white/30 outline-none
           focus:border-[var(--color-primary)]/60 focus:bg-white/10 transition-all duration-200"
        />
      </div>

      <!-- Auth & Wallet (desktop) -->
      <div class="hidden md:flex items-center gap-3 flex-shrink-0">
        {#if !isLoggedIn}
          <a
            href="/auth/login"
            class="px-4 py-1.5 rounded-lg text-sm font-semibold text-white/80
               hover:text-white hover:bg-white/8 transition-all duration-200"
          >
            Masuk
          </a>
          <a
            href="/auth/register"
            class="px-4 py-1.5 rounded-lg text-sm font-bold bg-[var(--color-primary)] text-black
               hover:bg-[#ffd740] shadow-md shadow-yellow-500/20
               transition-all duration-200 hover:shadow-yellow-500/40"
          >
            Daftar
          </a>
        {:else}
          <!-- SALDO + POIN MINI, hanya kalau userData sudah ada balances -->
          {#if userData?.userBalances}
            <div class="flex flex-col items-end mr-1">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-white/80"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
                  ></span>
                  <span>Saldo</span>
                  <span class="text-[var(--color-primary)]">
                    {formatWallet()}
                  </span>
                </span>
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/40 text-[10px] font-semibold text-yellow-300"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
                  <span>Poin</span>
                  <span>{formatPoints()}</span>
                </span>
              </div>
            </div>
          {/if}

          <button
            type="button"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10
              text-xs font-semibold text-white/80 hover:bg-white/10 transition-all"
            onclick={() => goto("/account")}
          >
            <div
              class="w-7 h-7 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center text-xs font-bold"
            >
              {displayName ? displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div class="flex flex-col items-start leading-tight">
              <span class="text-[11px] text-white/50">Masuk sebagai</span>
              <span class="text-xs text-white truncate max-w-[120px]">
                {displayName ?? "User"}
              </span>
            </div>
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/60
              hover:text-white hover:bg-white/8 border border-white/10 transition-all"
            onclick={handleLogout}
          >
            Keluar
          </button>
        {/if}
      </div>

      <!-- Mobile Hamburger -->
      <button
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        class="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center
           rounded-lg bg-white/5 border border-white/10 transition-colors hover:bg-white/10"
        aria-label="Toggle menu"
      >
        <div class="flex flex-col gap-1.5 w-4">
          <span
            class="block h-0.5 bg-white/70 transition-all duration-300
               {mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}"
          ></span>
          <span
            class="block h-0.5 bg-white/70 transition-all duration-300
               {mobileMenuOpen ? 'opacity-0' : ''}"
          ></span>
          <span
            class="block h-0.5 bg-white/70 transition-all duration-300
               {mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}"
          ></span>
        </div>
      </button>
    </div>

    <!-- Bottom Nav (desktop) -->
    <nav class="hidden md:block border-t border-white/5">
      <div
        class="mx-auto max-w-[1400px] w-full px-2 md:px-8 flex items-center gap-2 h-12 md:h-12"
      >
        {#each navItems() as item}
          {@const active = isActive(item.href, $page.url.pathname)}
          <a
            href={item.href}
            class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200
               {active
              ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20'
              : 'text-white/60 hover:text-white hover:bg-white/5'}"
          >
            <svelte:component this={item.icon} size="xs" />
            {item.label}
          </a>
        {/each}
      </div>
    </nav>

    <!-- Mobile Menu Drawer -->
    {#if mobileMenuOpen}
      <div
        class="md:hidden border-t border-white/10 bg-[#0f0f0f] px-4 py-3 space-y-1 animate-in slide-in-from-top-2"
      >
        {#each navItems() as item}
          {@const active = isActive(item.href, $page.url.pathname)}
          <a
            href={item.href}
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
               {active
              ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
              : 'text-white/70 hover:text-white hover:bg-white/5'}"
            onclick={() => (mobileMenuOpen = false)}
          >
            <svelte:component this={item.icon} size="xs" />
            {item.label}
          </a>
        {/each}

        {#if !isLoggedIn}
          <a
            href="/auth/login"
            onclick={() => (mobileMenuOpen = false)}
            class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold
             text-white/80 hover:text-white hover:bg-white/8 transition-colors border border-white/10"
          >
            Masuk
          </a>
          <a
            href="/auth/register"
            onclick={() => (mobileMenuOpen = false)}
            class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold
             bg-[var(--color-primary)] text-black hover:bg-[#ffd740]
             shadow-md shadow-yellow-500/20 transition-all duration-200"
          >
            Daftar Gratis
          </a>
        {:else}
          <!-- mobile user + saldo/point -->
          {#if userData?.userBalances}
            <div class="flex items-center justify-between mb-2">
              <span
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-white/80"
              >
                Saldo: <span class="text-[var(--color-primary)]">
                  {formatWallet()}
                </span>
              </span>
              <span
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/40 text-[10px] font-semibold text-yellow-300"
              >
                Poin: {formatPoints()}
              </span>
            </div>
          {/if}

          <button
            type="button"
            onclick={() => {
              mobileMenuOpen = false;
              goto("/account");
            }}
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
             bg-white/5 text-white hover:bg-white/10 border border-white/10"
          >
            <div
              class="w-8 h-8 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center text-sm font-bold"
            >
              {displayName ? displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div class="flex flex-col items-start leading-tight">
              <span class="text-[11px] text-white/50">Masuk sebagai</span>
              <span class="text-xs text-white truncate max-w-[140px]">
                {displayName ?? "User"}
              </span>
            </div>
          </button>
          <button
            type="button"
            onclick={() => {
              mobileMenuOpen = false;
              handleLogout();
            }}
            class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold
             text-white/80 hover:text-white hover:bg-white/8 transition-colors border border-white/10"
          >
            Keluar
          </button>
        {/if}
      </div>
    {/if}
  </header>

  <!-- MAIN CONTENT -->
  <main class="flex-1 max-w-[1400px] mx-auto w-full px-5 md:px-8 py-6">
    <div class="bg-pattern" aria-hidden="true"></div>
    {@render children()}
  </main>

  <!-- FOOTER -->
  <footer
    class="bg-[#0d0d0d]/80 backdrop-blur-xl border-t border-white/5 mt-auto"
  >
    <div class="max-w-[1400px] mx-auto w-full px-5 md:px-8 py-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <img src={siteConfig.logoUrl} width="50" alt="" />
            <span class="font-black text-[var(--color-primary)]"
              >{siteConfig.siteName}</span
            >
          </div>
          <p class="text-xs text-white/40 leading-relaxed max-w-[200px]">
            {siteConfig.tagline ??
              "Platform top-up game terpercaya di Indonesia."}
          </p>
        </div>

        {#each [{ title: "Layanan", links: [{ label: "Topup", href: "/" }, { label: "Cek Transaksi", href: "/invoice" }, { label: "Leaderboard", href: "/leaderboard" }] }, { title: "Info", links: [{ label: "Artikel", href: "/article" }, { label: "Kalkulator", href: "/calculator" }, { label: "FAQ", href: "/faq" }] }, { title: "Perusahaan", links: [{ label: "Tentang Kami", href: "/about" }, { label: "Hubungi Kami", href: "/contact" }] }] as col}
          <div>
            <h4
              class="text-xs font-bold text-white/50 uppercase tracking-widest mb-3"
            >
              {col.title}
            </h4>
            <ul class="space-y-2">
              {#each col.links as link}
                <li>
                  <a
                    href={link.href}
                    class="text-sm text-white/50 hover:text-[var(--color-primary)] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>

      <div
        class="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <p class="text-xs text-white/30">
          © 2026 {siteConfig.siteName}. All rights reserved.
        </p>
        <div class="flex items-center gap-4">
          <a
            href="/terms"
            class="text-xs text-white/30 hover:text-white/60 transition-colors"
            >Syarat & Ketentuan</a
          >
          <a
            href="/privacy"
            class="text-xs text-white/30 hover:text-white/60 transition-colors"
            >Kebijakan Privasi</a
          >
        </div>
      </div>
    </div>
  </footer>

  <!-- FLOATING CUSTOMER SERVICE -->
  <button
    class="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full
           bg-[var(--color-primary)] text-black text-sm font-bold shadow-xl shadow-yellow-500/30
           hover:bg-[#ffd740] hover:shadow-yellow-500/50 hover:scale-105
           transition-all duration-200 active:scale-95"
    aria-label="Customer Service"
    onclick={() => {
      window.open("https://wa.me/" + siteConfig.supportWhatsapp, "_blank");
    }}
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.5"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
    <span class="hidden sm:inline">Customer Service</span>
  </button>
</div>
