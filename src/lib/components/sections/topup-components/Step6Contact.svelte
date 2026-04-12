<script lang="ts">
  import { auth } from "$lib/auth";
  import { onMount } from "svelte";

  let { phone = $bindable(""), email = $bindable("") } = $props();

  // ===========================
  // COUNTRY DATA
  // ===========================
  type Country = {
    name: string;
    code: string; // ISO 3166-1 alpha-2
    dial: string; // dial code tanpa +
    flag: string; // emoji flag
  };

  const countries: Country[] = [
    { name: "Indonesia", code: "ID", dial: "62", flag: "🇮🇩" },
    { name: "Malaysia", code: "MY", dial: "60", flag: "🇲🇾" },
    { name: "Singapore", code: "SG", dial: "65", flag: "🇸🇬" },
    { name: "Philippines", code: "PH", dial: "63", flag: "🇵🇭" },
    { name: "Thailand", code: "TH", dial: "66", flag: "🇹🇭" },
    { name: "Vietnam", code: "VN", dial: "84", flag: "🇻🇳" },
    { name: "Brunei", code: "BN", dial: "673", flag: "🇧🇳" },
    { name: "Myanmar", code: "MM", dial: "95", flag: "🇲🇲" },
    { name: "Cambodia", code: "KH", dial: "855", flag: "🇰🇭" },
    { name: "Laos", code: "LA", dial: "856", flag: "🇱🇦" },
    { name: "Timor-Leste", code: "TL", dial: "670", flag: "🇹🇱" },
    { name: "Australia", code: "AU", dial: "61", flag: "🇦🇺" },
    { name: "United States", code: "US", dial: "1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "GB", dial: "44", flag: "🇬🇧" },
    { name: "Japan", code: "JP", dial: "81", flag: "🇯🇵" },
    { name: "South Korea", code: "KR", dial: "82", flag: "🇰🇷" },
    { name: "China", code: "CN", dial: "86", flag: "🇨🇳" },
    { name: "India", code: "IN", dial: "91", flag: "🇮🇳" },
    { name: "Saudi Arabia", code: "SA", dial: "966", flag: "🇸🇦" },
    { name: "United Arab Emirates", code: "AE", dial: "971", flag: "🇦🇪" },
    { name: "Qatar", code: "QA", dial: "974", flag: "🇶🇦" },
    { name: "Kuwait", code: "KW", dial: "965", flag: "🇰🇼" },
    { name: "Germany", code: "DE", dial: "49", flag: "🇩🇪" },
    { name: "France", code: "FR", dial: "33", flag: "🇫🇷" },
    { name: "Netherlands", code: "NL", dial: "31", flag: "🇳🇱" },
    { name: "Canada", code: "CA", dial: "1", flag: "🇨🇦" },
  ];

  // ===========================
  // STATE
  // ===========================
  let selectedCountry = $state<Country>(countries[0]); // default Indonesia
  let showDropdown = $state(false);
  let search = $state("");

  const filtered = $derived(
    search.trim() === ""
      ? countries
      : countries.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.dial.includes(search.replace(/\D/g, "")),
        ),
  );

  function selectCountry(c: Country) {
    selectedCountry = c;
    showDropdown = false;
    search = "";
  }

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-country-dropdown]")) {
      showDropdown = false;
      search = "";
    }
  }

  onMount(() => {
    auth.init();
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  });
</script>

<div class="step-card">
  <div class="step-accent"></div>
  <div class="px-5 py-4">
    <div class="step-header">
      <div class="step-badge">6</div>
      <h3 class="step-title">Detail Kontak</h3>
    </div>

    <label class="field-label block mb-2">No. WhatsApp</label>

    <div class="flex gap-2 mb-3">
      <!-- Country dropdown -->
      <div class="relative flex-shrink-0" data-country-dropdown>
        <button
          type="button"
          onclick={() => {
            showDropdown = !showDropdown;
            search = "";
          }}
          class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10
                 bg-white/[0.04] text-sm text-white/80 h-full
                 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200"
        >
          <!-- <span class="text-lg leading-none">{selectedCountry.flag}</span> -->
          <img
            src="https://flagcdn.com/24x18/{selectedCountry.code.toLowerCase()}.png"
            alt={selectedCountry.name}
            class="w-6 h-auto rounded-sm"
          />
          <span class="font-medium text-xs text-white/60"
            >+{selectedCountry.dial}</span
          >
          <svg
            class="w-3 h-3 text-white/30 transition-transform duration-200 {showDropdown
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

        {#if showDropdown}
          <div
            class="absolute left-0 top-full mt-1.5 z-100 w-64 rounded-xl border border-white/10
                   bg-[#161616] shadow-2xl shadow-black/60 overflow-hidden"
          >
            <!-- search -->
            <div class="p-2 border-b border-white/5">
              <input
                type="text"
                bind:value={search}
                placeholder="Cari negara atau kode..."
                autofocus
                class="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-1.5
                       text-xs text-white placeholder-white/30 outline-none
                       focus:border-[var(--color-primary)]/50"
              />
            </div>

            <!-- list -->
            <div class="max-h-52 overflow-y-auto country-list">
              {#if filtered.length === 0}
                <p class="text-xs text-white/30 text-center py-4">
                  Negara tidak ditemukan
                </p>
              {:else}
                {#each filtered as c (c.code)}
                  <button
                    type="button"
                    onclick={() => selectCountry(c)}
                    class="w-full flex items-center gap-2.5 px-3 py-2 text-left
                           hover:bg-white/[0.06] transition-colors duration-100
                           {selectedCountry.code === c.code
                      ? 'bg-[var(--color-primary)]/8'
                      : ''}"
                  >
                    <!-- <span class="text-base leading-none">{c.flag}</span> -->
                    <!-- di list item -->
                    <img
                      src="https://flagcdn.com/24x18/{c.code.toLowerCase()}.png"
                      alt={c.name}
                      class="w-5 h-auto rounded-sm shrink-0"
                    />
                    <span class="text-xs text-white flex-1 truncate"
                      >{c.name}</span
                    >
                    <span class="text-[10px] text-white/35 font-mono shrink-0"
                      >+{c.dial}</span
                    >
                    {#if selectedCountry.code === c.code}
                      <svg
                        class="w-3 h-3 text-[var(--color-primary)] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    {/if}
                  </button>
                {/each}
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <!-- Phone input -->
      <div class="relative flex-1">
        <input
          type="tel"
          bind:value={phone}
          placeholder={selectedCountry.code === "ID"
            ? "8960xxxx"
            : "Nomor telepon"}
          class="w-full bg-white/[0.04] border border-white/10 rounded-xl
                 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none
                 transition-all duration-200 focus:border-[var(--color-primary)]/60 focus:bg-white/[0.07]
                 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.08)]"
        />
        {#if phone.trim().length > 6}
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              class="w-4 h-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        {/if}
      </div>
    </div>

    <label class="field-label block mb-2 mt-4">Email</label>
    <div class="relative mb-3">
      <input
        type="email"
        bind:value={email}
        placeholder="topupinstore@email.com"
        disabled={auth.isLoggedIn}
        class="w-full bg-white/[0.04] border border-white/10 rounded-xl
               px-4 py-2.5 text-sm {auth.isLoggedIn
          ? 'text-white/60 cursor-not-allowed select-none'
          : 'text-white'} placeholder-white/20 outline-none
               transition-all duration-200 focus:border-[var(--color-primary)]/60 focus:bg-white/[0.07]
               focus:shadow-[0_0_0_3px_rgba(245,197,24,0.08)]"
      />
    </div>

    <p class="text-[10px] text-white/30 mb-3">
      Nomor ini akan dihubungi jika terjadi masalah, dan email dipakai buat
      proses invoice pembayaran.
    </p>

    <div
      class="flex items-start gap-3 p-3 rounded-xl bg-blue-500/[0.07] border border-blue-500/20"
    >
      <svg
        class="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-[11px] text-blue-300/70 leading-relaxed">
        Pastikan nomor WhatsApp benar, agar kami bisa menghubungi jika transaksi
        bermasalah.
        {#if selectedCountry.code === "ID"}
          Tulis tanpa angka <span class="font-bold text-blue-300">0</span> di
          depan. Contoh: <span class="font-bold text-blue-300">8960xxxx</span>
        {:else}
          Tulis tanpa kode negara di depan.
        {/if}
      </p>
    </div>
  </div>
</div>

<style>
  .step-card {
    position: relative;
    border-radius: 1rem;
    /* overflow: hidden; */
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #111111;
  }
  .step-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(
      to bottom,
      var(--color-primary),
      rgba(245, 197, 24, 0.3),
      transparent
    );
  }
  .step-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .step-badge {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 900;
    color: #000;
  }
  .step-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.025em;
    flex: 1;
  }
  .field-label {
    font-size: 0.625rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* di dalam <style> komponen */
  .country-list::-webkit-scrollbar {
    width: 4px;
  }

  .country-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .country-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
  }

  .country-list::-webkit-scrollbar-thumb:hover {
    background: rgba(245, 197, 24, 0.4); /* warna primary saat hover */
  }
</style>
