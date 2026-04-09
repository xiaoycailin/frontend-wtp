<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { auth } from "$lib/auth.svelte";
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
  } from "@boxicons/svelte";
  import type { SiteConfig } from "../../app.js";
  import { setupFetchInterceptor } from "$lib/setup/interceptor.js";

  let { data, children } = $props();

  const siteConfig: SiteConfig = data.siteConfig;
  let user: any = data.user;

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: Dashboard },
    { label: "Transaksi", href: "/admin/transactions", icon: Receipt },
    { label: "Produk", href: "/admin/products", icon: ProductHunt },
    { label: "Flash Sale", href: "/admin/flash-sale", icon: Bolt },
    { label: "Kategori", href: "/admin/category", icon: Categories },
    { label: "Pembayaran", href: "/admin/payments", icon: CardViewLarge },
    { label: "Activity Log", href: "/admin/activity-log", icon: Receipt },
    { label: "System Log", href: "/admin/system-log", icon: Receipt },
    { label: "Pengguna", href: "/admin/users", icon: User },
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
  <title>Admin Dashboard - {siteConfig.siteName}</title>
</svelte:head>

<div class="min-h-screen bg-[#050505] text-white flex">
  <!-- Sidebar -->
  <aside
    class="hidden md:flex md:flex-col w-64 bg-[#0b0b0b] border-r border-white/5
           fixed inset-y-0 left-0 z-40"
  >
    <!-- Brand -->
    <div class="h-14 flex items-center gap-2 px-5 border-b border-white/5">
      <div
        class="w-9 h-9 rounded-xl bg-[#f5c518] flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" class="w-5 h-5 text-black fill-current">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div class="flex flex-col leading-tight">
        <span class="text-xs text-white/40 font-semibold">Admin Panel</span>
        <span class="text-sm font-bold text-[#f5c518]"
          >{siteConfig.siteName}</span
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
            ? 'bg-[#f5c518]/15 text-[#f5c518] border border-[#f5c518]/40'
            : 'text-white/60 hover:text-white hover:bg-white/5'}"
        >
          <svelte:component this={item.icon} size="sm" />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <!-- User + Logout -->
    <div class="border-t border-white/5 px-4 py-3 flex items-center gap-3">
      <div
        class="w-9 h-9 rounded-full bg-[#f5c518]/15 border border-[#f5c518]/30
                  flex items-center justify-center text-[#f5c518] text-xs font-bold"
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
          class="w-8 h-8 rounded-full bg-[#f5c518]/15 border border-[#f5c518]/30
                    flex items-center justify-center text-[#f5c518] text-xs font-bold"
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
