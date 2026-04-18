<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { auth } from "$lib/auth";
  import "../layout.css";
  import {
    CardViewLarge,
    CaretDownSquare,
    Categories,
    Dashboard,
    Gear,
    ProductHunt,
    Receipt,
    User,
    Bolt,
    Discount,
    EditAlt, // Untuk Artikel
  } from "@boxicons/svelte";
  import { setupFetchInterceptor } from "$lib/setup/interceptor.js";

  let { data, children } = $props();

  // Accordion state for articles menu
  let articlesExpanded = $state(false);

  function toggleArticles() {
    articlesExpanded = !articlesExpanded;
  }

  const siteConfig = data.siteConfig;
  const primaryColor = siteConfig?.primaryColor ?? "#f5c518";
  const secondaryColor = siteConfig?.secondaryColor ?? "#0e0e0e";
  const accentColor = siteConfig?.accentColor ?? "#ffffff";
  let user: any = data.user;

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: Dashboard },
    { label: "Transaksi", href: "/admin/transactions", icon: Receipt },
    { label: "Produk", href: "/admin/products", icon: ProductHunt },
    { label: "Flash Sale", href: "/admin/flash-sale", icon: Bolt },
    { label: "Promotion", href: "/admin/promotions", icon: Discount },
    { label: "Kategori", href: "/admin/category", icon: Categories },
    { label: "Banners", href: "/admin/banners", icon: CaretDownSquare },
    { label: "Badge Library", href: "/admin/badges", icon: CaretDownSquare },
    { label: "Pembayaran", href: "/admin/payments", icon: CardViewLarge },
    { label: "Activity Log", href: "/admin/activity-log", icon: Receipt },
    { label: "System Log", href: "/admin/system-log", icon: Receipt },
    { label: "Pengguna", href: "/admin/users", icon: User },
    {
      label: "Topup Balance",
      href: "/admin/balance-topups",
      icon: CardViewLarge,
    },
    { label: "Site Config", href: "/admin/site-config", icon: Gear },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function logout() {
    auth.logout("/auth/login");
  }

  onMount(() => {
    auth.init();
    user = data.user;
    setupFetchInterceptor();
  });
</script>

<svelte:head>
  <title>Admin Dashboard - {siteConfig?.siteName}</title>
</svelte:head>

<div
  style="--color-primary: {primaryColor}; --color-secondary: {secondaryColor}; --color-accent: {accentColor};"
  class="min-h-screen bg-[#050505] text-white flex"
>
  <!-- Sidebar -->
  <aside
    class="hidden md:flex md:flex-col w-64 bg-[#0b0b0b] border-r border-white/5
           fixed inset-y-0 left-0 z-40"
  >
    <!-- Brand -->
    <div class="h-14 flex items-center gap-2 px-5 border-b border-white/5">
      <div
        class="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" class="w-5 h-5 text-black fill-current">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div class="flex flex-col leading-tight">
        <span class="text-xs text-white/40 font-semibold">Admin Panel</span>
        <span class="text-sm font-bold text-[var(--color-primary)]"
          >{siteConfig?.siteName}</span
        >
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {#each sidebarItems as item}
        {@const active = isActive(item.href, $page.url.pathname)}
        <a
          href={item.href}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                 transition-colors duration-150
                 {active
            ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/40'
            : 'text-white/60 hover:text-white hover:bg-white/5'}"
        >
          <svelte:component this={item.icon} size="sm" />
          <span>{item.label}</span>
        </a>
      {/each}

      <!-- Article Management (Expandable) -->
      <div class="group">
        <button
          type="button"
          onclick={toggleArticles}
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                 transition-colors duration-150 text-white/60 hover:text-white hover:bg-white/5"
        >
          <div class="flex items-center gap-3">
            <EditAlt size="sm" />
            <span>Artikel</span>
          </div>
          <svg
            class="w-4 h-4 transition-transform duration-200 {articlesExpanded
              ? 'rotate-180'
              : ''}"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- Submenu -->
        {#if articlesExpanded}
          <div class="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1 mb-2">
            <a
              href="/admin/articles"
              class={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150
                     ${
                       isActive("/admin/articles", $page.url.pathname)
                         ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                         : "text-white/50 hover:text-white/80 hover:bg-white/5"
                     }`}
            >
              Semua Artikel
            </a>
            <a
              href="/admin/articles/new"
              class={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150
                     ${
                       isActive("/admin/articles/new", $page.url.pathname)
                         ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                         : "text-white/50 hover:text-white/80 hover:bg-white/5"
                     }`}
            >
              Tambah Baru
            </a>
            <a
              href="/admin/articles/categories"
              class={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150
                     ${
                       isActive("/admin/articles/categories", $page.url.pathname)
                         ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                         : "text-white/50 hover:text-white/80 hover:bg-white/5"
                     }`}
            >
              Kategori Artikel
            </a>
            <a
              href="/admin/articles/tags"
              class={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150
                     ${
                       isActive("/admin/articles/tags", $page.url.pathname)
                         ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                         : "text-white/50 hover:text-white/80 hover:bg-white/5"
                     }`}
            >
              Tag Artikel
            </a>
          </div>
        {/if}
      </div>
    </nav>

    <!-- User + Logout -->
    <div class="border-t border-white/5 px-4 py-3 flex items-center gap-3">
      <div
        class="w-9 h-9 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30
                  flex items-center justify-center text-[var(--color-primary)] text-xs font-bold"
      >
        {user?.displayName?.charAt(0) ?? "A"}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold truncate">
          {user?.displayName ?? "Admin"}
        </p>
        <p class="text-[11px] text-white/40 truncate">{user?.email ?? ""}</p>
      </div>
      <button
        onclick={logout}
        class="text-[11px] text-white/50 hover:text-red-400 font-semibold"
      >
        Keluar
      </button>
    </div>
  </aside>

  <!-- Main column -->
  <div class="flex-1 flex flex-col md:ml-64 min-h-screen">
    <!-- Topbar -->
    <header
      class="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/5
             bg-[#050505]/90 backdrop-blur-sm sticky top-0 z-30"
    >
      <div class="flex items-center gap-2">
        <!-- Mobile menu button -->
        <button
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg
                 bg-white/5 border border-white/10"
          aria-label="Menu Admin"
        >
          <div class="space-y-1">
            <span class="block w-4 h-0.5 bg-white"></span>
            <span class="block w-4 h-0.5 bg-white"></span>
          </div>
        </button>
        <div>
          <p class="text-xs text-white/40">Panel Admin</p>
          <!-- <h1 class="text-sm font-semibold">{$page.data}</h1> -->
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="hidden sm:inline text-xs text-white/40">
          {user?.displayName ?? "Admin"}
        </span>
        <div
          class="w-8 h-8 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30
                    flex items-center justify-center text-[var(--color-primary)] text-xs font-bold"
        >
          {user?.displayName?.charAt(0) ?? "A"}
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 bg-[#050505] px-4 md:px-6 py-4">
      <div class="mx-auto">
        {@render children()}
      </div>
    </main>
  </div>
</div>
