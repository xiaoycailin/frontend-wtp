<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  // ── Props ─────────────────────────────────────────────────────
  interface Props {
    maxParticles?: number;
    colors?: string[];
    lineColor?: string;
    lineDistance?: number;
    speed?: number;
    opacity?: number;
    blendMode?: string;
    types?: Array<"dot" | "diamond" | "cross">;
    class?: string;
  }

  let {
    maxParticles = 75,
    colors = ["#f5c518cc", "#ffffffaa", "#00e5ff88", "#ff6b3588", "#a855f788"],
    lineColor = "#f5c518",
    lineDistance = 90,
    speed = 1,
    opacity = 0.65,
    blendMode = "screen",
    types = ["dot", "diamond", "cross"],
    class: className = "",
  }: Props = $props();

  // ── Internal ──────────────────────────────────────────────────
  let canvas: HTMLCanvasElement;
  let animFrame: number;
  let ro: ResizeObserver | null = null;
  let hidden = false; // Page Visibility state

  // ── Device tier detection ─────────────────────────────────────
  // [CHANGE 1] Deteksi mobile/low-end satu kali di awal.
  // Ini menentukan semua parameter rendering setelahnya.
  const isMobile =
    browser &&
    (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
      window.innerWidth < 768);
  const isLowEnd =
    browser &&
    (("deviceMemory" in navigator && (navigator as any).deviceMemory < 4) ||
      (navigator.hardwareConcurrency ?? 8) < 4);

  const tier: "high" | "mid" | "low" = isLowEnd
    ? "low"
    : isMobile
      ? "mid"
      : "high";

  const cfg = {
    high: {
      particles: maxParticles,
      fps: 60,
      shadows: true,
      lines: true,
      layers: 3,
    },
    mid: {
      particles: Math.ceil(maxParticles * 0.5),
      fps: 30,
      shadows: false,
      lines: true,
      layers: 1,
    },
    low: {
      particles: Math.ceil(maxParticles * 0.3),
      fps: 24,
      shadows: false,
      lines: false,
      layers: 1,
    },
  }[tier];

  // [CHANGE 3] Pre-compute lineDistance² untuk menghindari Math.sqrt() di inner loop.
  const lineDistSq = lineDistance * lineDistance;

  // [CHANGE 4] Frame throttle — hitung interval target dalam ms.
  const frameInterval = 1000 / cfg.fps;
  let lastFrameTime = 0;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    color: string;
    solidColor: string; // solidColor di-cache saat spawn
    type: "dot" | "diamond" | "cross";
    angle: number;
    spin: number;
    life: number;
    maxLife: number;
  }

  let particles: Particle[] = [];

  function spawnParticle(w: number, h: number): Particle {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const maxLife = 140 + Math.random() * 200;
    return {
      x: Math.random() * w,
      y: h + 10,
      vx: (Math.random() - 0.5) * 0.6 * speed,
      vy: -(0.3 + Math.random() * 1.0) * speed,
      size: 1.5 + Math.random() * 3.5,
      alpha: 0,
      color,
      // [CHANGE 5] Cache solid color saat spawn — tidak perlu slice() setiap frame.
      solidColor: color.length > 7 ? color.slice(0, 7) : color,
      type,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04,
      life: 0,
      maxLife,
    };
  }

  function drawShape(
    ctx: CanvasRenderingContext2D,
    type: Particle["type"],
    size: number,
  ) {
    if (type === "dot") {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "diamond") {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.65, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.65, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-size * 1.5, 0);
      ctx.lineTo(size * 1.5, 0);
      ctx.moveTo(0, -size * 1.5);
      ctx.lineTo(0, size * 1.5);
      ctx.stroke();
    }
  }

  // [CHANGE 6] drawParticle sekarang punya dua path:
  // - "high": 3-layer dengan shadowBlur (desktop seperti semula)
  // - "mid/low": 1-layer tanpa shadow sama sekali (mobile-safe)
  // shadowBlur adalah operasi GPU paling berat di canvas — ini penghematan terbesar.
  function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    if (cfg.shadows) {
      // ── Desktop: 3 layer glow (behavior asli) ──
      ctx.shadowColor = p.solidColor;
      ctx.shadowBlur = p.size * 10;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = p.alpha * 0.35;
      drawShape(ctx, p.type, p.size);

      ctx.shadowBlur = p.size * 5;
      ctx.globalAlpha = p.alpha * 0.7;
      drawShape(ctx, p.type, p.size * 0.7);

      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = p.size * 2;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#ffffffdd";
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = p.alpha * 0.95;
      drawShape(ctx, p.type, p.size * 0.3);
    } else {
      // ── Mobile: 1 layer flat, NO shadowBlur ──
      // [CHANGE 7] ctx.save/restore hanya 1x, bukan 3x.
      // shadowBlur = 0 secara eksplisit supaya tidak ada state tersisa.
      ctx.shadowBlur = 0;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = p.alpha;
      drawShape(ctx, p.type, p.size);
    }

    ctx.restore();
  }

  function init() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d", {
      // [CHANGE 8] willReadFrequently: false — hint ke browser bahwa kita
      // hanya write, tidak pernah readback. Memungkinkan GPU-accelerated path.
      willReadFrequently: false,
    })!;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    // Pre-seed
    for (let i = 0; i < Math.floor(cfg.particles * 0.7); i++) {
      const p = spawnParticle(w, h);
      p.y = Math.random() * h;
      p.life = Math.random() * p.maxLife * 0.6;
      p.alpha = Math.random() * opacity * 0.8;
      particles.push(p);
    }

    // [CHANGE 9] Simpan ro ke variable agar bisa di-disconnect di onDestroy.
    ro = new ResizeObserver(() => {
      if (!canvas) return;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    });
    ro.observe(canvas);

    // [CHANGE 10] Page Visibility API — hentikan loop saat tab tidak aktif.
    // Ini gratis: zero CPU saat user pindah tab.
    const onVisibilityChange = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    function tick(now: number) {
      animFrame = requestAnimationFrame(tick);

      // [CHANGE 11] Frame throttle — lewati frame jika belum waktunya.
      if (now - lastFrameTime < frameInterval) return;
      lastFrameTime = now;

      // [CHANGE 12] Pause saat tab hidden — tidak perlu render.
      if (hidden) return;

      ctx.clearRect(0, 0, w, h);

      if (particles.length < cfg.particles && Math.random() < 0.5)
        particles.push(spawnParticle(w, h));

      const fadeFrames = 40;
      particles = particles.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;

        if (p.life < fadeFrames) p.alpha = (p.life / fadeFrames) * opacity;
        else if (p.life > p.maxLife - fadeFrames)
          p.alpha = ((p.maxLife - p.life) / fadeFrames) * opacity;

        drawParticle(ctx, p);
        return p.life < p.maxLife && p.y > -20;
      });

      // [CHANGE 13] Connection lines: skip sepenuhnya pada tier "low",
      // dan gunakan distSq (tanpa Math.sqrt) pada tier "mid"/"high".
      if (cfg.lines) {
        for (let i = 0; i < particles.length; i++) {
          const pi = particles[i];
          for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
            const pj = particles[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            // [CHANGE 14] Squared distance — tidak butuh Math.sqrt().
            const dSq = dx * dx + dy * dy;
            if (dSq < lineDistSq) {
              ctx.save();
              ctx.globalAlpha = (1 - Math.sqrt(dSq) / lineDistance) * 0.07;
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }
    }

    animFrame = requestAnimationFrame(tick);

    // Simpan cleanup untuk visibilitychange
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }

  let cleanupVis: (() => void) | undefined;
  onMount(() => {
    cleanupVis = init() ?? undefined;
  });

  onDestroy(() => {
    if (!browser) return;
    cancelAnimationFrame(animFrame);
    // [CHANGE 15] Disconnect ResizeObserver — cegah memory leak.
    ro?.disconnect();
    cleanupVis?.();
    particles = [];
  });
</script>

<canvas
  bind:this={canvas}
  class="absolute inset-0 w-full h-full pointer-events-none {className}"
  style="mix-blend-mode: {blendMode};"
></canvas>
