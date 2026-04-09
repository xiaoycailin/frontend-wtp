<script lang="ts">
  let { phone = $bindable(""), email = $bindable("") } = $props();
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
      <!-- Country code -->
      <button
        class="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10
               bg-white/[0.04] text-sm text-white/70 flex-shrink-0
               hover:border-white/20 transition-colors duration-200"
      >
        <span class="text-base">ðŸ‡®ðŸ‡©</span>
        <span class="font-medium text-xs">+62</span>
        <svg class="w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Phone input -->
      <div class="relative flex-1">
        <input
          type="tel"
          bind:value={phone}
          placeholder="8960xxxx"
          class="w-full bg-white/[0.04] border border-white/10 rounded-xl
                 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none
                 transition-all duration-200 focus:border-[var(--color-primary)]/60 focus:bg-white/[0.07]
                 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.08)]"
        />
        {#if phone.trim().length > 6}
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
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
        placeholder="nama@email.com"
        class="w-full bg-white/[0.04] border border-white/10 rounded-xl
               px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none
               transition-all duration-200 focus:border-[var(--color-primary)]/60 focus:bg-white/[0.07]
               focus:shadow-[0_0_0_3px_rgba(245,197,24,0.08)]"
      />
    </div>

    <p class="text-[10px] text-white/30 mb-3">
      Nomor ini akan dihubungi jika terjadi masalah, dan email dipakai buat proses invoice pembayaran.
    </p>

    <div class="flex items-start gap-3 p-3 rounded-xl bg-blue-500/[0.07] border border-blue-500/20">
      <svg class="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-[11px] text-blue-300/70 leading-relaxed">
        Pastikan nomor WhatsApp benar, agar kami bisa menghubungi jika transaksi bermasalah.
        Tulis tanpa angka <span class="font-bold text-blue-300">0</span> di depan.
        Contoh: <span class="font-bold text-blue-300">8960xxxx</span>
      </p>
    </div>
  </div>
</div>

<style>
  .step-card {
    position: relative; border-radius: 1rem; overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.07); background: #111111;
  }
  .step-accent {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: linear-gradient(to bottom, var(--color-primary), rgba(245, 197, 24, 0.3), transparent);
  }
  .step-header {
    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;
  }
  .step-badge {
    width: 1.75rem; height: 1.75rem; border-radius: 0.5rem; background: var(--color-primary);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 0.75rem; font-weight: 900; color: #000;
  }
  .step-title {
    font-size: 0.875rem; font-weight: 700;
    color: #fff; letter-spacing: 0.025em; flex: 1;
  }
  .field-label {
    font-size: 0.625rem; font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase; letter-spacing: 0.1em;
  }
</style>

