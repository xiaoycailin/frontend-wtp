<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from "$app/state";
  import "./layout.css";

  const is404 = $derived(page.status === 404);

  const title = $derived(
    is404 ? "Halaman tidak ditemukan" : "Terjadi kesalahan",
  );

  const description = $derived(
    is404
      ? "Link yang kamu buka mungkin sudah berubah, salah ketik, atau memang belum tersedia."
      : page.error?.message ||
          "Ada masalah saat memproses permintaan kamu. Coba lagi beberapa saat.",
  );
</script>

<svelte:head>
  <title>{page.status} • {title}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-[#0c0c0c] text-white">
  <div
    class="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-16"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,197,24,0.14),transparent_35%)]"
    ></div>
    <div
      class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.02),transparent)]"
    ></div>

    <div class="relative z-10 w-full max-w-2xl">
      <div
        class="rounded-3xl border border-white/5 bg-white/[0.03] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10"
      >
        <div class="mb-6 flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5c518]/10 ring-1 ring-[#f5c518]/20"
          >
            <div class="h-2.5 w-2.5 rounded-full bg-[#f5c518]"></div>
          </div>

          <div>
            <p
              class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f5c518]/80"
            >
              System notice
            </p>
            <p class="text-sm text-white/45">Error boundary</p>
          </div>
        </div>

        <div class="space-y-4">
          <p
            class="inline-flex rounded-full border border-[#f5c518]/20 bg-[#f5c518]/10 px-3 py-1 text-xs font-semibold text-[#f5c518]"
          >
            Error {page.status}
          </p>

          <h1
            class="max-w-xl text-3xl font-bold tracking-tight text-white md:text-5xl"
          >
            {title}
          </h1>

          <p class="max-w-lg text-sm leading-7 text-white/60 md:text-base">
            {description}
          </p>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/"
            class="inline-flex h-11 items-center justify-center rounded-xl bg-[#f5c518] px-5 text-sm font-semibold text-black transition hover:brightness-95 active:scale-[0.98]"
          >
            Kembali ke beranda
          </a>

          <button
            type="button"
            on:click={() => history.back()}
            class="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.98]"
          >
            Halaman sebelumnya
          </button>
        </div>

        <div class="mt-8 border-t border-white/5 pt-5">
          <div class="flex flex-wrap items-center gap-3 text-xs text-white/35">
            <span class="rounded-full border border-white/10 px-2.5 py-1">
              Status: {page.status}
            </span>

            {#if page.error?.message}
              <span
                class="truncate rounded-full border border-white/10 px-2.5 py-1 max-w-full"
              >
                {page.error.message}
              </span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
