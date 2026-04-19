<script lang="ts">
  import { onMount } from "svelte";

  let needRefresh = $state(false);
  let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

  onMount(async () => {
    const { registerSW } = await import("virtual:pwa-register");

    updateSW = registerSW({
      onNeedRefresh() {
        needRefresh = true; // ← muncul prompt saat ada update
        console.log("Update Available reload page now");
      },
      onOfflineReady() {
        console.log("App siap digunakan offline");
      },
    });
  });

  function update() {
    updateSW?.(true); // ← reload ke versi baru
  }

  function dismiss() {
    needRefresh = false;
  }
</script>

{#if needRefresh}
  <div
    class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm
              bg-[#1a1a1a] border border-yellow-400/30 rounded-2xl p-4 shadow-xl"
  >
    <p class="text-white text-sm mb-3">
      🎉 Versi baru tersedia! Perbarui untuk mendapatkan fitur terbaru.
    </p>
    <div class="flex gap-2">
      <button
        onclick={update}
        class="flex-1 bg-yellow-400 text-black font-semibold text-sm py-2 rounded-xl hover:bg-yellow-300 transition"
      >
        Perbarui Sekarang
      </button>
      <button
        onclick={dismiss}
        class="px-4 text-gray-400 text-sm hover:text-white transition"
      >
        Nanti
      </button>
    </div>
  </div>
{/if}
