<script lang="ts">
  import ParticleCanvas from "$lib/components/ParticleCanvas.svelte";
  import TiltCard from "../TiltCard.svelte";

  let { productDetail } = $props();
</script>

<TiltCard glowColor="#a855f7" maxTilt={6} scale={1.05}>
  <section
    class="relative w-full overflow-visible rounded-2xl"
    style="background: linear-gradient(135deg, #0d0f1c 0%, #1a1a1a 50%, #0d0d0d 100%); min-height: 320px; border: 1px solid rgba(255,255,255,0.06);"
    role="banner"
  >
    <!-- Ambient glow blobs -->
    <div
      class="absolute -top-16 left-1/3 w-72 h-72 rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(109,86,230,0.15) 0%, transparent 70%); filter: blur(36px);"
      aria-hidden="true"
    ></div>
    <div
      class="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 70%); filter: blur(40px);"
      aria-hidden="true"
    ></div>

    <!-- Top accent line -->
    <div
      class="absolute top-0 left-0 w-full h-[2px] pointer-events-none rounded-t-2xl"
      style="background: linear-gradient(90deg, transparent 0%, #facc15 30%, #facc15 70%, transparent 100%);"
      aria-hidden="true"
    ></div>

    <!-- Main layout -->
    <div
      class="relative flex flex-col md:flex-row items-stretch min-h-[320px]"
      style="overflow: visible;"
    >
      <div
        class="relative flex-shrink-0 flex items-end justify-center md:w-72 w-full h-[280px] md:h-auto"
        style="perspective: 900px; perspective-origin: 50% 50%; overflow: visible;"
      >
        <div
          class="relative w-full h-full flex items-end justify-center cursor-pointer"
          role="img"
          aria-label="Mobile Legends hero card"
        >
          <!-- Hero image -->

          <img
            src={productDetail.thumbnail}
            alt="Mobile Legends Hero"
            class="absolute inset-0 w-full h-full object-cover rounded-xl select-none"
            loading="lazy"
            draggable="false"
            on:error={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <!-- Cinematic bottom fade -->
          <div
            class="absolute inset-0 rounded-xl pointer-events-none z-10"
            style="background: linear-gradient(to top, rgba(13,13,26,0.55) 0%, transparent 55%);"
            aria-hidden="true"
          ></div>

          <!-- Floor glow line -->

          <!-- Floating dot particles -->
          {#each [{ x: 14, y: 22, size: 2.5, delay: "0s", op: 0.55 }, { x: 82, y: 30, size: 3, delay: "0.35s", op: 0.45 }, { x: 72, y: 72, size: 2, delay: "0.7s", op: 0.6 }, { x: 22, y: 68, size: 2, delay: "1.1s", op: 0.4 }, { x: 55, y: 15, size: 1.5, delay: "0.55s", op: 0.35 }] as dot}
            <div
              class="absolute rounded-full pointer-events-none z-20"
              aria-hidden="true"
            ></div>
          {/each}

          <!-- Corner accent diamonds -->
          {#each [{ pos: "top-2 left-2", rot: "45deg" }, { pos: "top-2 right-2", rot: "45deg" }] as corner}
            <div
              class="absolute {corner.pos} pointer-events-none z-20"
              style="
                  width: 6px; height: 6px;
                  background: #facc15;
                  transform: rotate({corner.rot});
                  opacity: 0.7;
                  transition: opacity 0.4s ease;
                  box-shadow: 0 0 6px rgba(250,204,21,0.6);
                "
              aria-hidden="true"
            ></div>
          {/each}
        </div>
      </div>

      <!-- Vertical divider -->
      <div
        class="hidden md:block w-px flex-shrink-0 self-stretch my-6"
        style="background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent);"
        aria-hidden="true"
      ></div>

      <!-- CENTER: Content -->
      <div
        class="flex flex-col justify-center px-8 md:px-10 py-10 flex-1 gap-4"
      >
        <div class="-mt-1">
          <h1
            class="font-black leading-none uppercase"
            style="font-size: clamp(2rem, 4vw, 3rem); color: #facc15; letter-spacing: 0.01em;"
          >
            {productDetail?.title}
          </h1>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold
             bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
          >
            {productDetail?.brand}
          </span>
        </div>

        <p
          class="text-sm leading-relaxed"
          style="color: #8b95b0; max-width: 26rem;"
        >
          {productDetail.description}
        </p>

        <div class="flex flex-wrap gap-2">
          {#each [{ icon: productDetail.instant ? "âš¡" : "ðŸ¤š", label: productDetail.instant ? "Instan" : "Di Proses Manual" }, { icon: "ðŸ’¬", label: "CS 24/7" }, { icon: "ðŸ”’", label: "Aman" }, { icon: "ðŸ†", label: "Terpercaya" }] as feat}
            <span
              class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
              style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: #94a3b8;"
            >
              {feat.icon}
              {feat.label}
            </span>
          {/each}
        </div>
      </div>

      <!-- RIGHT: Stats -->
      <div
        class="hidden lg:flex flex-col justify-center gap-6 px-8 py-10 flex-shrink-0 w-52"
        style="border-left: 1px solid #32394e;"
      >
        {#each [{ value: "500K+", label: "Transaksi" }, { value: "4.9â˜…", label: "Rating" }, { value: "<1 Min", label: "Proses" }] as stat}
          <div class="flex flex-col gap-1">
            <span class="font-black text-2xl" style="color: #facc15;"
              >{stat.value}</span
            >
            <span
              class="text-xs uppercase tracking-widest"
              style="color: #a2abc3;">{stat.label}</span
            >
            <div class="h-px w-full" style="background: #32394e;"></div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Bottom accent line -->
    <div
      class="absolute bottom-0 left-0 w-full h-px pointer-events-none"
      style="background: linear-gradient(90deg, transparent, rgba(250,204,21,0.3) 50%, transparent);"
      aria-hidden="true"
    ></div>
  </section>
  <ParticleCanvas class="z-10" />
</TiltCard>

<style>
  @keyframes shine {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(250%);
    }
  }

  @keyframes float-dot {
    from {
      transform: translateY(0px);
    }
    to {
      transform: translateY(-6px);
    }
  }
</style>

