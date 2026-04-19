<script lang="ts">
  import { goto } from "$app/navigation";
  import { navState } from "$lib/stores/navigation";
  import { Diamonds, History, Plus, Star } from "@boxicons/svelte";
  import { onMount } from "svelte";

  interface Props {
    gems?: number;
    points?: number;
    username?: string;
  }

  let { gems = 0, points = 0, username = "Topupper" }: Props = $props();

  // Animasi angka naik dari 0
  let displayGems = $state(0);
  let displayPoints = $state(0);

  function animateCount(target: number, setter: (v: number) => void) {
    const duration = 1000;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(interval);
      } else {
        setter(Math.floor(current));
      }
    }, duration / steps);
  }

  onMount(() => {
    setTimeout(() => {
      animateCount(gems, (v) => (displayGems = v));
      animateCount(points, (v) => (displayPoints = v));
    }, 200);
  });

  function goToAccount() {
    navState.set({ from: "wallet", data: { tab: "history" } });
    goto("/account");
  }
</script>

<div class="mb-4 px-1">
  <!-- Animated Gradient Border Wrapper -->
  <div
    class="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/40 via-yellow-600/10 to-transparent"
  >
    <!-- Card Utama -->
    <div
      class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1c1a14] via-[#141414] to-[#0d0d0d] p-4"
    >
      <!-- Shimmer overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12 animate-shimmer pointer-events-none"
      ></div>

      <!-- Glow blobs -->
      <div
        class="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none"
      ></div>
      <div
        class="absolute -bottom-6 -left-6 w-28 h-28 bg-amber-600/10 rounded-full blur-2xl pointer-events-none"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"
      ></div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-4 relative z-10">
        <div class="flex items-center gap-2.5">
          <!-- Avatar placeholder -->
          <div
            class="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-xs shadow-lg shadow-yellow-500/20"
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p class="text-gray-500 text-[10px] leading-none mb-0.5">
              Selamat datang
            </p>
            <p class="text-white font-bold text-sm leading-none">
              {username} 👋
            </p>
          </div>
        </div>

        <!-- Badge -->
        <div
          class="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/25 rounded-xl px-3 py-1.5"
        >
          <div
            class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"
          ></div>
          <span class="text-yellow-400 text-[10px] font-bold tracking-wide"
            >MY WALLET</span
          >
        </div>
      </div>

      <!-- Divider -->
      <div
        class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4 relative z-10"
      ></div>

      <!-- Wallet Items -->
      <div class="grid grid-cols-2 gap-3 relative z-10">
        <!-- T-Gems -->
        <div
          class="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] rounded-xl p-3 border border-white/5 hover:border-yellow-400/30 transition-all duration-300 overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/5 transition-all duration-300 rounded-xl"
          ></div>
          <div class="flex items-center gap-2 mb-2.5 relative z-10">
            <div
              class="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400/30 to-amber-600/20 flex items-center justify-center shadow-inner"
            >
              <Diamonds size="sm" class="text-yellow-300" />
            </div>
            <span class="text-gray-400 text-[11px] font-medium">T-Gems</span>
          </div>
          <p
            class="text-yellow-300 font-black text-xl leading-none tracking-tight relative z-10"
          >
            {displayGems.toLocaleString("id-ID")}
          </p>
          <p class="text-gray-600 text-[10px] mt-1 relative z-10">
            Gems tersedia
          </p>
        </div>

        <!-- T-Points -->
        <div
          class="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] rounded-xl p-3 border border-white/5 hover:border-yellow-400/30 transition-all duration-300 overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/5 transition-all duration-300 rounded-xl"
          ></div>
          <div class="flex items-center gap-2 mb-2.5 relative z-10">
            <div
              class="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400/30 to-amber-600/20 flex items-center justify-center shadow-inner"
            >
              <Star size="sm" class="text-yellow-300" />
            </div>
            <span class="text-gray-400 text-[11px] font-medium">T-Points</span>
          </div>
          <p
            class="text-white font-black text-xl leading-none tracking-tight relative z-10"
          >
            {displayPoints.toLocaleString("id-ID")}
          </p>
          <p class="text-gray-600 text-[10px] mt-1 relative z-10">
            Poin tersedia
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex gap-2 mt-3 relative z-10">
        <a
          href="/topup"
          class="group flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-yellow-400/15 to-amber-500/10 hover:from-yellow-400/25 hover:to-amber-500/20 border border-yellow-400/25 hover:border-yellow-400/50 rounded-xl py-2.5 transition-all duration-300 shadow-sm shadow-yellow-500/10"
        >
          <Plus
            size="xs"
            class="text-yellow-400 group-hover:rotate-90 transition-transform duration-300"
          />
          <span class="text-yellow-400 text-xs font-bold">Top Up</span>
        </a>
        <button
          onclick={goToAccount}
          class="group cursor-pointer flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 rounded-xl py-2.5 transition-all duration-300"
        >
          <History
            size="xs"
            class="text-gray-400 group-hover:text-gray-200 transition-colors duration-200"
          />
          <span
            class="text-gray-400 group-hover:text-gray-200 text-xs font-semibold transition-colors duration-200"
            >Riwayat</span
          >
        </button>
      </div>
    </div>
  </div>
</div>
