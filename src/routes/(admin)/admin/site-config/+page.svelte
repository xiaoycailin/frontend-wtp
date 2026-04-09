<script lang="ts">
  import type { SiteConfig } from "../../../../app.js";
  import ImageUrlField from "$lib/components/admin/ImageUrlField.svelte";
  const { data } = $props();

  const fallbackConfig: any = {
    id: 0,
    createdAt: "",
    updatedAt: "",
    siteName: "",
    tagline: "",
    description: "",
    siteUrl: "",
    logoUrl: "",
    logoAlt: "",
    faviconUrl: "",
    timezone: "Asia/Jakarta",
    locale: "id-ID",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    metaRobots: "index, follow",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogImageAlt: "",
    ogType: "website",
    ogLocale: "id_ID",
    fbAppId: "",
    twitterCard: "summary_large_image",
    twitterSite: "",
    twitterCreator: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    schemaOrgType: "Organization",
    schemaOrgJson: "",
    googleSiteVerification: "",
    bingSiteVerification: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    tiktokPixelId: "",
    contactEmail: "",
    supportEmail: "",
    supportWhatsapp: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    discordUrl: "",
    telegramUrl: "",
    maintenanceMode: false,
    maintenanceTitle: "",
    maintenanceMessage: "",
    primaryColor: "var(--color-primary)",
    secondaryColor: "#0e0e0e",
    accentColor: "#ffffff",
    extras: [],
  };

  const siteConfig = (data.siteConfig ?? {}) as Partial<SiteConfig>;
  let config = $state({ ...fallbackConfig, ...siteConfig });

  let savingKey = $state<string | null>(null);
  let error = $state<string | null>(null);
  let fieldErrors = $state<Record<string, string[]>>({});

  function normalizeConfig(obj: any) {
    const copy: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined || v === "") continue;
      copy[k] = v;
    }
    return copy;
  }
  async function updateField(key: keyof SiteConfig, value: any) {
    savingKey = key as string;
    error = null;
    fieldErrors = {};

    const body = normalizeConfig({ [key]: value });

    try {
      const res = await fetch("/api/v1/site-config", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        const fe = json?.data?.errors?.fieldErrors;
        if (fe) fieldErrors = fe;
        throw new Error(json?.data?.message ?? "Gagal menyimpan konfigurasi");
      }
      config = { ...config, ...(body as any) };
    } catch (e: any) {
      console.error(e);
      error = e?.message ?? "Gagal menyimpan konfigurasi";
    } finally {
      savingKey = null;
    }
  }

  async function saveAll() {
    error = null;
    fieldErrors = {};
    savingKey = "ALL";

    try {
      const payload = normalizeConfig(config);
      const res = await fetch("/api/v1/site-config", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        const fe = json?.data?.errors?.fieldErrors;
        if (fe) fieldErrors = fe;
        throw new Error(json?.data?.message ?? "Gagal menyimpan konfigurasi");
      }
    } catch (e: any) {
      console.error(e);
      error = e?.message ?? "Gagal menyimpan konfigurasi";
    } finally {
      savingKey = null;
    }
  }

  function onBlurText(
    key: any,
    e: Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement },
  ) {
    const value = e.currentTarget.value;
    if ((config as any)[key] === value) return;
    updateField(key, value);
  }

  function onChangeCheckbox(
    key: any,
    e: Event & { currentTarget: HTMLInputElement },
  ) {
    const value = e.currentTarget.checked;
    if ((config as any)[key] === value) return;
    updateField(key, value);
  }
</script>

<section class="space-y-6 max-w-4xl">
  <header class="space-y-1">
    <p class="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-[0.18em]">
      Site Config
    </p>
    <h1 class="text-2xl md:text-3xl font-black text-white leading-snug">
      Pengaturan Website
    </h1>
    <p class="text-xs md:text-sm text-white/50 mt-1">
      Atur informasi dasar, SEO, dan integrasi tracking untuk situs kamu.
    </p>
  </header>

  {#if error}
    <div
      class="text-xs text-red-300 bg-red-500/10 border border-red-500/40 px-3 py-2 rounded-lg"
    >
      {error}
    </div>
  {/if}

  <!-- INFORMASI DASAR -->
  <section class="space-y-4 bg-[#0c0c0c] border border-white/5 rounded-2xl p-4">
    <h2 class="text-xs font-semibold text-white/80 uppercase tracking-[0.16em]">
      Informasi Dasar
    </h2>
    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">Nama Situs</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.siteName}
          onblur={(e) => onBlurText("siteName", e)}
        />
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Tagline</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.tagline}
          onblur={(e) => onBlurText("tagline", e)}
        />
      </div>
    </div>

    <div class="text-xs">
      <label class="text-white/60 text-xs mb-1 block">Deskripsi</label>
      <textarea
        rows="3"
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[var(--color-primary)]/70 resize-y"
        bind:value={config.description}
        onblur={(e) => onBlurText("description", e)}
      ></textarea>
    </div>

    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">URL Situs</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.siteUrl}
          onblur={(e) => onBlurText("siteUrl", e)}
        />
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Zona Waktu</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.timezone}
          onblur={(e) => onBlurText("timezone", e)}
        />
      </div>
    </div>
  </section>

  <!-- BRANDING -->
  <section class="space-y-4 bg-[#0c0c0c] border border-white/5 rounded-2xl p-4">
    <h2 class="text-xs font-semibold text-white/80 uppercase tracking-[0.16em]">
      Branding
    </h2>
    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <ImageUrlField
          label="Logo URL"
          bind:value={config.logoUrl}
          placeholder="https://asset.../logo.png"
          help="Upload/pilih gambar lalu klik di luar field untuk auto-save."
        />
      </div>
      <div>
        <ImageUrlField
          label="Favicon URL"
          bind:value={config.faviconUrl}
          placeholder="https://asset.../favicon.png"
          help="Upload/pilih gambar lalu klik di luar field untuk auto-save."
        />
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">Primary Color</label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            class="w-10 h-10 rounded border border-white/10 bg-transparent"
            bind:value={config.primaryColor}
            onchange={(e) => onBlurText("primaryColor", e)}
          />
          <input
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                   focus:outline-none focus:border-[var(--color-primary)]/70"
            bind:value={config.primaryColor}
            onblur={(e) => onBlurText("primaryColor", e)}
          />
        </div>
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Secondary Color</label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            class="w-10 h-10 rounded border border-white/10 bg-transparent"
            bind:value={config.secondaryColor}
            onchange={(e) => onBlurText("secondaryColor", e)}
          />
          <input
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                   focus:outline-none focus:border-[var(--color-primary)]/70"
            bind:value={config.secondaryColor}
            onblur={(e) => onBlurText("secondaryColor", e)}
          />
        </div>
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Accent Color</label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            class="w-10 h-10 rounded border border-white/10 bg-transparent"
            bind:value={config.accentColor}
            onchange={(e) => onBlurText("accentColor", e)}
          />
          <input
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                   focus:outline-none focus:border-[var(--color-primary)]/70"
            bind:value={config.accentColor}
            onblur={(e) => onBlurText("accentColor", e)}
          />
        </div>
      </div>
    </div>
  </section>

  <!-- SEO & META -->
  <section class="space-y-4 bg-[#0c0c0c] border border-white/5 rounded-2xl p-4">
    <h2 class="text-xs font-semibold text-white/80 uppercase tracking-[0.16em]">
      SEO & Meta
    </h2>

    <div class="text-xs">
      <label class="text-white/60 text-xs mb-1 block">Meta Title</label>
      <input
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[var(--color-primary)]/70"
        bind:value={config.metaTitle}
        onblur={(e) => onBlurText("metaTitle", e)}
      />
    </div>

    <div class="text-xs">
      <label class="text-white/60 text-xs mb-1 block">Meta Description</label>
      <textarea
        rows="3"
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[var(--color-primary)]/70 resize-y"
        bind:value={config.metaDescription}
        onblur={(e) => onBlurText("metaDescription", e)}
      ></textarea>
    </div>

    <div class="text-xs">
      <label class="text-white/60 text-xs mb-1 block">Meta Keywords</label>
      <input
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[var(--color-primary)]/70"
        bind:value={config.metaKeywords}
        onblur={(e) => onBlurText("metaKeywords", e)}
      />
    </div>

    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">Meta Robots</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.metaRobots}
          onblur={(e) => onBlurText("metaRobots", e)}
        />
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Canonical URL</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.canonicalUrl}
          onblur={(e) => onBlurText("canonicalUrl", e)}
        />
        {#if fieldErrors.canonicalUrl}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.canonicalUrl[0]}
          </p>
        {/if}
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <ImageUrlField
          label="OG Image URL"
          bind:value={config.ogImage}
          placeholder="https://..."
          help="Bisa paste manual atau pilih dari image manager."
        />
        {#if fieldErrors.ogImage}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.ogImage[0]}
          </p>
        {/if}
      </div>
      <div>
        <ImageUrlField
          label="Twitter Image URL"
          bind:value={config.twitterImage}
          placeholder="https://..."
          help="Bisa paste manual atau pilih dari image manager."
        />
        {#if fieldErrors.twitterImage}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.twitterImage[0]}
          </p>
        {/if}
      </div>
    </div>
  </section>

  <!-- KONTAK & SOSIAL -->
  <section class="space-y-4 bg-[#0c0c0c] border border-white/5 rounded-2xl p-4">
    <h2 class="text-xs font-semibold text-white/80 uppercase tracking-[0.16em]">
      Kontak & Sosial
    </h2>

    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">Email Utama</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.contactEmail}
          onblur={(e) => onBlurText("contactEmail", e)}
        />
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Email Support</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.supportEmail}
          onblur={(e) => onBlurText("supportEmail", e)}
        />
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">WhatsApp Support</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.supportWhatsapp}
          onblur={(e) => onBlurText("supportWhatsapp", e)}
        />
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Facebook URL</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.facebookUrl}
          onblur={(e) => onBlurText("facebookUrl", e)}
        />
        {#if fieldErrors.facebookUrl}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.facebookUrl[0]}
          </p>
        {/if}
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">Instagram URL</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.instagramUrl}
          onblur={(e) => onBlurText("instagramUrl", e)}
        />
        {#if fieldErrors.instagramUrl}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.instagramUrl[0]}
          </p>
        {/if}
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Twitter URL</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.twitterUrl}
          onblur={(e) => onBlurText("twitterUrl", e)}
        />
        {#if fieldErrors.twitterUrl}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.twitterUrl[0]}
          </p>
        {/if}
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">YouTube URL</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.youtubeUrl}
          onblur={(e) => onBlurText("youtubeUrl", e)}
        />
        {#if fieldErrors.youtubeUrl}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.youtubeUrl[0]}
          </p>
        {/if}
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">TikTok URL</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.tiktokUrl}
          onblur={(e) => onBlurText("tiktokUrl", e)}
        />
        {#if fieldErrors.tiktokUrl}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.tiktokUrl[0]}
          </p>
        {/if}
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="text-white/60 text-xs mb-1 block">Discord URL</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.discordUrl}
          onblur={(e) => onBlurText("discordUrl", e)}
        />
        {#if fieldErrors.discordUrl}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.discordUrl[0]}
          </p>
        {/if}
      </div>
      <div>
        <label class="text-white/60 text-xs mb-1 block">Telegram URL</label>
        <input
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
                 focus:outline-none focus:border-[var(--color-primary)]/70"
          bind:value={config.telegramUrl}
          onblur={(e) => onBlurText("telegramUrl", e)}
        />
        {#if fieldErrors.telegramUrl}
          <p class="mt-1 text-[11px] text-red-300">
            {fieldErrors.telegramUrl[0]}
          </p>
        {/if}
      </div>
    </div>
  </section>

  <!-- MAINTENANCE -->
  <section class="space-y-4 bg-[#0c0c0c] border border-white/5 rounded-2xl p-4">
    <h2 class="text-xs font-semibold text-white/80 uppercase tracking-[0.16em]">
      Mode Pemeliharaan
    </h2>

    <div class="flex items-center justify-between text-xs">
      <div class="space-y-0.5">
        <p class="text-white/80">Aktifkan maintenance mode</p>
        <p class="text-white/40">
          Jika aktif, pengunjung akan melihat halaman pemeliharaan.
        </p>
      </div>
      <label class="inline-flex items-center gap-2">
        <input
          type="checkbox"
          class="rounded border-white/20 bg-black/60"
          checked={config.maintenanceMode}
          onchange={(e) => onChangeCheckbox("maintenanceMode", e)}
        />
        <span class="text-white/80 text-xs">
          {config.maintenanceMode ? "Aktif" : "Nonaktif"}
        </span>
      </label>
    </div>

    <div class="text-xs">
      <label class="text-white/60 text-xs mb-1 block">Judul Maintenance</label>
      <input
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[var(--color-primary)]/70"
        bind:value={config.maintenanceTitle}
        onblur={(e) => onBlurText("maintenanceTitle", e)}
      />
    </div>

    <div class="text-xs">
      <label class="text-white/60 text-xs mb-1 block">Pesan Maintenance</label>
      <textarea
        rows="2"
        class="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white
               focus:outline-none focus:border-[var(--color-primary)]/70 resize-y"
        bind:value={config.maintenanceMessage}
        onblur={(e) => onBlurText("maintenanceMessage", e)}
      ></textarea>
    </div>
  </section>

  <!-- ACTION BAR -->
  <div class="flex justify-end pt-2">
    <button
      type="button"
      class="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-black
             hover:bg-[#ffd740] disabled:opacity-50"
      disabled={savingKey === "ALL"}
      onclick={saveAll}
    >
      {savingKey === "ALL" ? "Menyimpan..." : "Simpan Semua Perubahan"}
    </button>
  </div>
</section>

