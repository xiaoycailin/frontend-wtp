<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { navState } from "$lib/stores/navigation";
  import { Groceries, Receipt, UserCircle, HomeAlt } from "@boxicons/svelte";
  import { isPWA } from "$lib/utils";

  let currentPage = $state("");

  navState.subscribe((value) => {
    if (value.from === "wallet" || value.from === "navbottom") {
      currentPage = value.data?.tab ?? "";
    }
  });

  function setState(tab: string) {
    navState.set({ from: "navbottom", data: { tab } });
    goto("/account");
  }

  const navItems = [
    {
      label: "Beranda",
      icon: HomeAlt,
      onclick: () => goto("/"),
      isActive: () => page.url.pathname === "/",
    },
    {
      label: "Produk",
      icon: Groceries,
      onclick: () => goto("/products"),
      isActive: () => page.url.pathname === "/products",
    },
    {
      label: "Transaksi",
      icon: Receipt,
      onclick: () => setState("transactions"),
      isActive: () =>
        page.url.pathname === "/account" &&
        (currentPage === "transactions" || currentPage === "history"),
    },
    {
      label: "Akun",
      icon: UserCircle,
      onclick: () => setState("profile"),
      isActive: () =>
        page.url.pathname === "/account" &&
        currentPage !== "transactions" &&
        currentPage !== "history",
    },
  ];
</script>

{#if isPWA()}
  <!-- Spacer -->
  <div class="h-20"></div>

  <!-- Bottom Nav -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 px-4 pb-1 pointer-events-none">
    <div class="pointer-events-auto max-w-lg mx-auto">
      <div
        class="relative flex items-center justify-around bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 shadow-2xl shadow-black/50"
      >
        {#each navItems as item}
          {@const isActive = item.isActive()}
          <button
            onclick={item.onclick}
            class="cursor-pointer relative flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all duration-200 group
            {isActive
              ? 'text-yellow-400'
              : 'text-gray-500 hover:text-gray-300'}"
          >
            {#if isActive}
              <div class="absolute inset-0 bg-yellow-400/10 rounded-xl"></div>
            {/if}

            <!-- ← Render sebagai Svelte component, bukan <i> tag -->
            <svelte:component
              this={item.icon}
              size="sm"
              class="transition-transform duration-200 {isActive
                ? 'scale-110'
                : 'group-hover:scale-105'}"
            />

            <span
              class="text-[10px] font-medium leading-none transition-all duration-200
            {isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}"
            >
              {item.label}
            </span>

            {#if isActive}
              <div
                class="absolute -bottom-1 w-1 h-1 bg-yellow-400 rounded-full"
              ></div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </nav>
{/if}
