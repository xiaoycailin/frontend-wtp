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

  type BalanceItem = { type: "WALLET" | "POINTS"; amount: string };

  let userData = $state<any>(data.user ?? null);
  let siteConfig = data?.siteConfig ?? {};
  const primaryColor = siteConfig?.primaryColor ?? "#f5c518";
  const secondaryColor = siteConfig?.secondaryColor ?? "#0e0e0e";
  const accentColor = siteConfig?.accentColor ?? "#ffffff";

  let mobileMenuOpen = $state(false);
  let searchQuery = $state("");
  let scrolled = $state(false);
  let userMenuOpen = $state(false);

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

  const navItems = $derived(() => {
    const items = [
      { label: "Topup", href: "/", icon: Basket },
      { label: "Produk", href: "/products", icon: ShoppingBag },
      { label: "Cek Transaksi", href: "/invoice", icon: MenuSearch },
      { label: "Leaderboard", href: "/leaderboard", icon: TrophyStar },
      { label: "Artikel", href: "/article", icon: Newspaper },
    ];
    if (isLoggedIn)
      items.push({ label: "Akun Saya", href: "/account", icon: User });
    return items;
  });

  function isActive(href: string, pathname: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  onMount(() => {
    auth.init();
    setupFetchInterceptor();

    const onScroll = () => {
      scrolled = window.scrollY > 12;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const closeUserMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) userMenuOpen = false;
    };
    document.addEventListener("click", closeUserMenu);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", closeUserMenu);
    };
  });

  $effect(() => {
    isLoggedIn = auth.isLoggedIn ?? data.token != null;
    displayName = auth.user?.displayName ?? auth.user?.email ?? null;
  });

  // Close mobile menu on route change
  $effect(() => {
    $page.url.pathname;
    mobileMenuOpen = false;
  });

  function handleLogout() {
    auth.logout?.();
    userMenuOpen = false;
    goto("/");
  }

  function getBalance(type: "WALLET" | "POINTS") {
    return (
      userData?.userBalances?.find((b: BalanceItem) => b.type === type)
        ?.amount ?? "0"
    );
  }
  function formatWallet() {
    const n = Number(getBalance("WALLET"));
    return Number.isFinite(n) ? "Rp " + n.toLocaleString("id-ID") : "Rp 0";
  }
  function formatPoints() {
    const n = Number(getBalance("POINTS"));
    return Number.isFinite(n) ? n.toLocaleString("id-ID") : "0";
  }
  function getInitial() {
    return displayName ? displayName.charAt(0).toUpperCase() : "U";
  }
</script>

<SeoHead {siteConfig} />
<Index />

<div
  style="--color-primary: {primaryColor}; --color-secondary: {secondaryColor}; --color-accent: {accentColor};"
  class="min-h-screen bg-[#080808] text-white font-sans flex flex-col"
>
  <!-- ══════════════════════════════════════
       NAVBAR
  ══════════════════════════════════════ -->
  <header
    class="sticky top-0 z-50 transition-all duration-300 {scrolled
      ? 'bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/60'
      : 'bg-transparent border-b border-transparent'}"
  >
    <!-- Main nav row -->
    <div
      class="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center gap-4"
    >
      <!-- Logo -->
      <a href="/" class="shrink-0 flex items-center gap-2.5 group">
        {#if siteConfig?.logoUrl}
          <img
            src={siteConfig.logoUrl}
            width="36"
            height="36"
            alt={siteConfig.siteName}
            class="rounded-xl transition-all duration-200 group-hover:brightness-110"
          />
        {:else}
          <div
            class="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-black font-black text-sm transition-all duration-200 group-hover:brightness-110"
          >
            {(siteConfig.siteName ?? "T").charAt(0)}
          </div>
        {/if}
        <span
          class="hidden sm:block font-black text-base text-white group-hover:text-[var(--color-primary)] transition-colors duration-200"
        >
          {siteConfig.siteName ?? "Topupin"}
        </span>
      </a>

      <!-- Search -->
      <div class="flex-1 max-w-sm relative group">
        <div
          class="absolute inset-y-0 left-3 flex items-center pointer-events-none"
        >
          <svg
            class="w-3.5 h-3.5 text-white/30 group-focus-within:text-[var(--color-primary)] transition-colors"
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
          placeholder="Cari game atau voucher..."
          class="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(245,197,24,0.07)] transition-all duration-200"
        />
      </div>

      <!-- Spacer -->
      <div class="flex-1 hidden md:block"></div>

      <!-- Desktop: Auth area -->
      <div class="hidden md:flex items-center gap-2 shrink-0">
        {#if !isLoggedIn}
          <a
            href="/auth/login"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
          >
            Masuk
          </a>
          <a
            href="/auth/register"
            class="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-black hover:brightness-110 shadow-lg shadow-yellow-500/15 hover:shadow-yellow-500/30 transition-all duration-200 active:scale-[0.98]"
          >
            Daftar Gratis
          </a>
        {:else}
          <!-- Saldo + Poin chips -->
          {#if userData?.userBalances}
            <div class="flex items-center gap-1.5">
              <a
                href="/topup"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/15 transition-all duration-200"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
                ></span>
                <span
                  class="text-[11px] font-bold text-[var(--color-primary)] tabular-nums"
                  >{formatWallet()}</span
                >
              </a>
              <div
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400/8 border border-yellow-400/20"
              >
                <svg
                  class="w-3 h-3 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
                <span class="text-[11px] font-bold text-yellow-400 tabular-nums"
                  >{formatPoints()}</span
                >
              </div>
            </div>
          {/if}

          <!-- User menu -->
          <div class="relative" data-user-menu>
            <button
              type="button"
              onclick={() => (userMenuOpen = !userMenuOpen)}
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] hover:border-white/15 transition-all duration-200"
              aria-expanded={userMenuOpen}
            >
              <div
                class="w-7 h-7 rounded-lg bg-[var(--color-primary)] text-black flex items-center justify-center text-xs font-black shrink-0"
              >
                {getInitial()}
              </div>
              <span
                class="text-sm font-semibold text-white/80 max-w-[100px] truncate hidden lg:block"
              >
                {displayName ?? "Akun"}
              </span>
              <svg
                class="w-3.5 h-3.5 text-white/40 transition-transform duration-200 {userMenuOpen
                  ? 'rotate-180'
                  : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown -->
            {#if userMenuOpen}
              <div
                class="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#111111] border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden"
                style="animation: dropIn 0.15s cubic-bezier(0.16,1,0.3,1);"
              >
                <div class="px-4 py-3 border-b border-white/[0.06]">
                  <p
                    class="text-[10px] text-white/35 font-semibold uppercase tracking-wider"
                  >
                    Masuk sebagai
                  </p>
                  <p class="text-sm font-bold text-white mt-0.5 truncate">
                    {displayName ?? "User"}
                  </p>
                </div>
                <div class="p-1.5">
                  <a
                    href="/account"
                    onclick={() => (userMenuOpen = false)}
                    class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Akun Saya
                  </a>
                  <a
                    href="/topup"
                    onclick={() => (userMenuOpen = false)}
                    class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Topup Saldo
                  </a>
                  {#if userData?.role === "admin"}
                    <a
                      href="/admin"
                      onclick={() => (userMenuOpen = false)}
                      class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
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
                          d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                        />
                      </svg>
                      Dashboard Admin
                    </a>
                  {/if}
                </div>
                <div class="p-1.5 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onclick={handleLogout}
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Keluar
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Mobile hamburger -->
      <button
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        class="md:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] transition-colors hover:bg-white/10"
        aria-label="Toggle menu"
      >
        <svg
          class="w-4 h-4 text-white/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {#if mobileMenuOpen}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          {:else}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M4 6h16M4 12h16M4 18h16"
            />
          {/if}
        </svg>
      </button>
    </div>

    <!-- Desktop nav tabs -->
    <nav class="hidden md:block border-t border-white/[0.05]">
      <div class="max-w-[1400px] mx-auto px-8 h-11 flex items-center gap-0.5">
        {#each navItems() as item}
          {@const active = isActive(item.href, $page.url.pathname)}
          <a
            href={item.href}
            class="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 {active
              ? 'text-[var(--color-primary)]'
              : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'}"
          >
            <svelte:component this={item.icon} size="xs" />
            {item.label}
            {#if active}
              <span
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-primary)]"
              ></span>
            {/if}
          </a>
        {/each}
      </div>
    </nav>

    <!-- Mobile drawer -->
    {#if mobileMenuOpen}
      <div
        class="md:hidden border-t border-white/[0.07] bg-[#0c0c0c]"
        style="animation: slideDown 0.2s cubic-bezier(0.16,1,0.3,1);"
      >
        <!-- User info (if logged in) -->
        {#if isLoggedIn}
          <div class="px-4 pt-4 pb-3 border-b border-white/[0.06]">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-black flex items-center justify-center font-black shrink-0"
              >
                {getInitial()}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-white truncate">
                  {displayName ?? "User"}
                </p>
                {#if userData?.userBalances}
                  <div class="flex items-center gap-2 mt-1">
                    <span
                      class="text-[10px] font-semibold text-[var(--color-primary)] tabular-nums"
                      >{formatWallet()}</span
                    >
                    <span class="text-white/20 text-[10px]">•</span>
                    <span
                      class="text-[10px] font-semibold text-yellow-400 tabular-nums"
                      >{formatPoints()} pts</span
                    >
                  </div>
                {/if}
              </div>
              <a
                href="/topup"
                onclick={() => (mobileMenuOpen = false)}
                class="shrink-0 ml-auto px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-black text-[11px] font-black"
                >+ Topup</a
              >
            </div>
          </div>
        {/if}

        <!-- Nav links -->
        <div class="p-3 space-y-0.5">
          {#each navItems() as item}
            {@const active = isActive(item.href, $page.url.pathname)}
            <a
              href={item.href}
              onclick={() => (mobileMenuOpen = false)}
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors {active
                ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/[0.08]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'}"
            >
              <svelte:component this={item.icon} size="xs" />
              {item.label}
              {#if active}
                <span
                  class="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
                ></span>
              {/if}
            </a>
          {/each}
        </div>

        <!-- Auth actions -->
        <div class="px-3 pb-4 pt-2 border-t border-white/[0.06] space-y-2">
          {#if !isLoggedIn}
            <a
              href="/auth/register"
              onclick={() => (mobileMenuOpen = false)}
              class="flex items-center justify-center py-3 rounded-xl bg-[var(--color-primary)] text-black font-black text-sm hover:brightness-110 transition-all active:scale-[0.98]"
            >
              Daftar Gratis
            </a>
            <a
              href="/auth/login"
              onclick={() => (mobileMenuOpen = false)}
              class="flex items-center justify-center py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 font-semibold text-sm hover:text-white hover:bg-white/10 transition-all"
            >
              Masuk
            </a>
          {:else}
            {#if userData?.role === "admin"}
              <a
                href="/admin"
                onclick={() => (mobileMenuOpen = false)}
                class="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold text-sm hover:bg-[var(--color-primary)]/15 transition-all"
              >
                Dashboard Admin →
              </a>
            {/if}
            <button
              type="button"
              onclick={() => {
                mobileMenuOpen = false;
                handleLogout();
              }}
              class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 font-semibold text-sm hover:text-red-400 hover:bg-red-500/[0.06] hover:border-red-500/20 transition-all"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Keluar dari Akun
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </header>

  <!-- ══════════════════════════════════════
       MAIN
  ══════════════════════════════════════ -->
  <main class="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6">
    {@render children()}
  </main>

  <!-- ══════════════════════════════════════
       FOOTER
  ══════════════════════════════════════ -->
  <footer class="mt-auto border-t border-white/[0.05] bg-[#060606]">
    <!-- Top section -->
    <div class="max-w-[1400px] mx-auto px-4 md:px-8 pt-12 pb-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <a href="/" class="flex items-center gap-2.5 mb-4 group w-fit">
            {#if siteConfig?.logoUrl}
              <img
                src={siteConfig.logoUrl}
                width="32"
                height="32"
                alt=""
                class="rounded-lg"
              />
            {:else}
              <div
                class="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-black font-black text-sm"
              >
                {(siteConfig.siteName ?? "T").charAt(0)}
              </div>
            {/if}
            <span
              class="font-black text-white group-hover:text-[var(--color-primary)] transition-colors"
            >
              {siteConfig.siteName ?? "Topupin"}
            </span>
          </a>
          <p class="text-[13px] text-white/35 leading-relaxed max-w-[200px]">
            {siteConfig.tagline ??
              "Platform top-up game terpercaya di Indonesia."}
          </p>
          <!-- Trust badges -->
          <div class="flex items-center gap-2 mt-5">
            <div
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]"
            >
              <svg
                class="w-3 h-3 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span class="text-[10px] font-bold text-white/40">Aman</span>
            </div>
            <div
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]"
            >
              <svg
                class="w-3 h-3 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span class="text-[10px] font-bold text-white/40">Instan</span>
            </div>
          </div>
        </div>

        <!-- Link columns -->
        {#each [{ title: "Layanan", links: [{ label: "Top-up Game", href: "/" }, { label: "Voucher", href: "/products" }, { label: "Cek Transaksi", href: "/invoice" }, { label: "Leaderboard", href: "/leaderboard" }] }, { title: "Informasi", links: [{ label: "Artikel", href: "/article" }, { label: "Kalkulator", href: "/calculator" }, { label: "FAQ", href: "/faq" }, { label: "Promo", href: "/promo" }] }, { title: "Perusahaan", links: [{ label: "Tentang Kami", href: "/about" }, { label: "Hubungi Kami", href: "/contact" }, { label: "Syarat & Ketentuan", href: "/terms" }, { label: "Kebijakan Privasi", href: "/privacy" }] }] as col}
          <div>
            <h4
              class="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4"
            >
              {col.title}
            </h4>
            <ul class="space-y-2.5">
              {#each col.links as link}
                <li>
                  <a
                    href={link.href}
                    class="text-[13px] text-white/45 hover:text-white transition-colors duration-150"
                    >{link.label}</a
                  >
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-white/[0.04]">
      <div
        class="max-w-[1400px] mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <p class="text-[12px] text-white/20">
          © 2026 {siteConfig.siteName ?? "Topupin"}. All rights reserved.
        </p>
        <div class="flex items-center gap-1">
          <div
            class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
          ></div>
          <span class="text-[11px] text-white/25"
            >Semua sistem berjalan normal</span
          >
        </div>
      </div>
    </div>
  </footer>

  <!-- ══════════════════════════════════════
       FLOATING CS BUTTON
  ══════════════════════════════════════ -->
  <button
    class="fixed bottom-5 right-5 z-40 group flex items-center gap-2.5 pl-3 pr-4 py-3 rounded-2xl bg-[var(--color-primary)] text-black font-bold shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:brightness-105 active:scale-[0.97] transition-all duration-200"
    aria-label="Customer Service"
    onclick={() =>
      window.open("https://wa.me/" + siteConfig.supportWhatsapp, "_blank")}
  >
    <!-- Animated ping -->
    <span class="relative flex h-2 w-2">
      <span
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/30"
      ></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-black/40"
      ></span>
    </span>
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.5"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
    <span class="text-sm">Bantuan</span>
  </button>
</div>

<style>
  @keyframes dropIn {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
