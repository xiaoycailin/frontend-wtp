<!--
  TiltCard.svelte
  ───────────────────────────────────────────────────────────────
  Komponen wrapper reusable untuk efek:
    • 3D perspective tilt mengikuti mouse
    • Glow border kuning saat hover
    • Bottom glow line
    • Shine sweep overlay

  PROPS:
    glowColor   — warna glow & border (default: #f5c518)
    maxTilt     — maksimum derajat tilt (default: 8)
    scale       — scale saat hover (default: 1.03)
    class       — tambahan class Tailwind dari parent

  USAGE:
    <TiltCard>
      <img src="..." />
      <p>konten bebas</p>
    </TiltCard>

  ───────────────────────────────────────────────────────────────
-->

<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    glowColor?: string;
    maxTilt?: number;
    scale?: number;
    class?: string;
    children: Snippet;
  }

  let {
    glowColor = "#f5c518",
    maxTilt = 8,
    scale = 1.03,
    class: extraClass = "",
    children,
  }: Props = $props();

  // ── State ──────────────────────────────────────────────────
  let hovered = $state(false);
  let rx = $state(0);
  let ry = $state(0);
  let cardEl: HTMLDivElement;

  // ── Handlers ───────────────────────────────────────────────
  function onMouseMove(e: MouseEvent) {
    const rect = cardEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rx = ((e.clientY - cy) / (rect.height / 2)) * -maxTilt;
    ry = ((e.clientX - cx) / (rect.width / 2)) * maxTilt;
  }

  function onMouseLeave() {
    hovered = false;
    rx = 0;
    ry = 0;
  }

  // ── Derived transform string ────────────────────────────────
  let transform = $derived(
    `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${hovered ? scale : 1},${hovered ? scale : 1},1)`,
  );
</script>

<div
  bind:this={cardEl}
  class="relative overflow-hidden rounded-2xl cursor-pointer {extraClass}"
  style="
    transform: {transform};
    transition: transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    box-shadow: {hovered
    ? `0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px ${glowColor}33, 0 0 30px ${glowColor}14`
    : '0 4px 16px rgba(0,0,0,0.3)'};
    border: 1px solid {hovered ? `${glowColor}33` : 'rgba(255,255,255,0.07)'};
    will-change: transform;
  "
  onmouseenter={() => (hovered = true)}
  onmousemove={onMouseMove}
  onmouseleave={onMouseLeave}
  role="group"
>
  <!-- Shine sweep overlay -->
  <div
    class="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
    style="
      opacity: {hovered ? 1 : 0};
      background: linear-gradient(
        115deg,
        transparent 30%,
        rgba(255,255,255,0.08) 50%,
        transparent 70%
      );
    "
    aria-hidden="true"
  ></div>

  <!-- Slot: konten dari parent -->
  {@render children()}

  <!-- Bottom glow line -->
  <div
    class="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-10 transition-opacity duration-300"
    style="
      opacity: {hovered ? 1 : 0};
      background: linear-gradient(to right, transparent, {glowColor}, transparent);
      box-shadow: 0 0 8px {glowColor};
    "
    aria-hidden="true"
  ></div>
</div>
