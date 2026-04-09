<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import ParticleCanvas from "../ParticleCanvas.svelte";
  import TiltCard from "../TiltCard.svelte";

  // â”€â”€ Slides â€” ganti src dengan path gambar banner asli â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const slides = [
    {
      src: "https://img.lapakgaming.com/?src=https%3A%2F%2Fwww.lapakgaming.com%2Fstatic%2Fbanner%2Flapakgaming%2F202604%2F1448x520-HB-MLBB-x-Naruto-ID-2+%281%29.png&w=1920&q=75&f=webp&onerror=redirect",
      alt: "Februari Starlight â€“ Hilda Guardian Battalion",
    },
    {
      src: "https://api.duniagames.co.id/api/content/upload/images/DG_266582.png",
      alt: "Battle Night Chest Level 5",
    },
    {
      src: "https://static-src.vocagame.com/gopay/GG-ROBLOX-GIFT-CARD-PROMO-APRIL-WEB-BANNER-a6d5-original.webp",
      alt: "Top Up Diamond Promo",
    },
  ];

  // â”€â”€ Slider state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let currentSlide = $state(0);
  let autoplayTimer: ReturnType<typeof setInterval>;

  // â”€â”€ Drag state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let isDragging = $state(false);
  let dragStartX = 0;
  let dragCurrentX = $state(0);
  let dragOffset = $derived(
    isDragging ? Math.min(Math.max(dragCurrentX - dragStartX, -220), 220) : 0,
  );

  const DRAG_THRESHOLD = 50;

  function onMouseDown(e: MouseEvent) {
    isDragging = true;
    dragStartX = e.clientX;
    dragCurrentX = e.clientX;
    clearInterval(autoplayTimer);
  }
  function onMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
  }
  function onMouseUp() {
    if (isDragging) commitDrag();
  }
  function onMouseLeave() {
    if (isDragging) commitDrag();
  }

  function onTouchStart(e: TouchEvent) {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragCurrentX = e.touches[0].clientX;
    clearInterval(autoplayTimer);
  }
  function onTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    dragCurrentX = e.touches[0].clientX;
    if (Math.abs(dragCurrentX - dragStartX) > 10) e.preventDefault();
  }
  function onTouchEnd() {
    if (isDragging) commitDrag();
  }

  function commitDrag() {
    const delta = dragCurrentX - dragStartX;
    if (delta < -DRAG_THRESHOLD) nextSlide();
    else if (delta > DRAG_THRESHOLD) prevSlide();
    isDragging = false;
    dragCurrentX = 0;
    dragStartX = 0;
    resetTimer();
  }

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }
  function goTo(i: number) {
    currentSlide = i;
    resetTimer();
  }
  function resetTimer() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  onMount(() => {
    resetTimer();
  });
  onDestroy(() => {
    if (!browser) return;
    clearInterval(autoplayTimer);
  });
</script>

<!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     BANNER SECTION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
<TiltCard maxTilt={0.5}>
  <section
    class="relative w-full overflow-hidden rounded-2xl bg-[#0a0a0a]"
    style="aspect-ratio: 16/5; min-height: 160px; max-height: 420px;"
  >
    <!-- â”€â”€ Image Slider Track â”€â”€ -->
    <div
      class="absolute inset-0 flex will-change-transform"
      style="
        width: {slides.length * 100}%;
        transform: translateX(calc(-{currentSlide *
        (100 / slides.length)}% + {dragOffset / slides.length}px));
        transition: {isDragging
        ? 'none'
        : 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)'};
        cursor: {isDragging ? 'grabbing' : 'grab'};
        user-select: none;
      "
      onmousedown={onMouseDown}
      onmousemove={onMouseMove}
      onmouseup={onMouseUp}
      onmouseleave={onMouseLeave}
      ontouchstart={onTouchStart}
      ontouchmove={onTouchMove}
      ontouchend={onTouchEnd}
      role="region"
      aria-label="Banner slider"
    >
      {#each slides as slide}
        <div
          class="relative h-full overflow-hidden"
          style="width: {100 / slides.length}%;"
        >
          <img
            src={slide.src}
            alt={slide.alt}
            class="w-full h-full object-cover object-center pointer-events-none"
            draggable="false"
          />
          <!-- Per-slide vignette -->
          <div
            class="absolute inset-0 pointer-events-none"
            style="background:
              linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.2) 100%),
              linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%);"
          ></div>
        </div>
      {/each}
    </div>

    <!-- â”€â”€ Corner decorations â”€â”€ -->
    <div
      class="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl pointer-events-none"
      style="z-index:12;"
    ></div>
    <div
      class="absolute top-3 right-12 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr pointer-events-none"
      style="z-index:12;"
    ></div>
    <div
      class="absolute bottom-10 left-3 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl pointer-events-none"
      style="z-index:12;"
    ></div>

    <!-- â”€â”€ Left Arrow â”€â”€ -->
    <button
      onclick={() => {
        prevSlide();
        resetTimer();
      }}
      class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full
             flex items-center justify-center backdrop-blur-md
             bg-black/40 border border-white/15 text-white/80
             hover:bg-black/65 hover:text-white hover:scale-105
             active:scale-95 transition-all duration-200"
      style="z-index: 20;"
      aria-label="Previous slide"
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
          stroke-width="2.5"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <!-- â”€â”€ Right Arrow â”€â”€ -->
    <button
      onclick={() => {
        nextSlide();
        resetTimer();
      }}
      class="absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full
             flex items-center justify-center backdrop-blur-md
             bg-black/40 border border-white/15 text-white/80
             hover:bg-black/65 hover:text-white hover:scale-105
             active:scale-95 transition-all duration-200"
      style="z-index: 20;"
      aria-label="Next slide"
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
          stroke-width="2.5"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>

    <!-- â”€â”€ Takapedia vertical label â”€â”€ -->
    <div
      class="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center
             border-l border-white/10 bg-black/30 backdrop-blur-sm pointer-events-none"
      style="z-index: 15; writing-mode: vertical-rl;"
    >
      <span class="text-[9px] font-bold tracking-[4px] text-white/30 uppercase"
        >WTPANJAY</span
      >
    </div>

    <!-- â”€â”€ Dot indicators â”€â”€ -->
    <div
      class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
      style="z-index: 20;"
    >
      {#each slides as _, i}
        <button
          onclick={() => goTo(i)}
          class="rounded-full transition-all duration-300"
          style="
            width: {i === currentSlide ? '22px' : '6px'};
            height: 6px;
            background: {i === currentSlide
            ? 'var(--color-primary)'
            : 'rgba(255,255,255,0.3)'};
          "
          aria-label="Slide {i + 1}"
        ></button>
      {/each}
    </div>
    <!-- â”€â”€ Particle Canvas â”€â”€ -->
    <ParticleCanvas maxParticles={20} />
  </section>
</TiltCard>

