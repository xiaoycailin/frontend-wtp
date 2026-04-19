<script>
  import { goto } from "$app/navigation";
</script>

<svelte:head>
  <title>Tidak Ada Koneksi - TopupIn</title>
</svelte:head>

<div
  class="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center text-white px-4"
>
  <img
    src="/icons/icon-192x192.png"
    alt="TopupIn"
    class="w-24 h-24 mb-6 opacity-80"
  />

  <h1 class="text-2xl font-bold mb-2">Kamu Sedang Offline</h1>
  <p class="text-gray-400 text-center mb-8">
    Periksa koneksi internet kamu dan coba lagi.
  </p>

  <button
    onclick={() => window.location.reload()}
    class="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl hover:bg-yellow-300 transition"
  >
    Coba Lagi
  </button>
</div>
