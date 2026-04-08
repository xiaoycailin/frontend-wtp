// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}
interface SiteConfig {
  siteName?: string | null;
  siteUrl?: string | null;
  tagline?: string | null;

  // Meta
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  metaRobots?: string | null;
  canonicalUrl?: string | null;

  // Open Graph
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  ogType?: string | null;
  ogLocale?: string | null;
  fbAppId?: string | null;

  // Twitter
  twitterCard?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;

  // Schema.org
  schemaOrgType?: string | null;
  schemaOrgJson?: string | null;

  // Verifikasi
  googleSiteVerification?: string | null;
  bingSiteVerification?: string | null;

  // Analytics
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  facebookPixelId?: string | null;
  tiktokPixelId?: string | null;

  // Favicon
  faviconUrl?: string | null;
  logoUrl?: string | null;

  // Kontak (untuk schema.org)
  contactEmail?: string | null;
  supportWhatsapp?: string | null;

  // Sosial
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
}

interface Props {
  siteConfig?: SiteConfig | null;
  // Override per-halaman — prioritas lebih tinggi dari siteConfig
  pageTitle?: string;
  pageDescription?: string;
  pageImage?: string;
  pageUrl?: string;
  pageType?: string; // "article", "product", "website"
  noIndex?: boolean; // true = halaman ini tidak di-index
}

export { SiteConfig, Props };
