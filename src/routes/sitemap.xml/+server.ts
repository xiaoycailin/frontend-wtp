import type { RequestHandler } from "./$types";

const BASE_URL = "https://wtpanjay.com";

export const GET: RequestHandler = async ({ fetch }) => {
  const staticPages = [
    "",
    "/products",
    "/about",
    "/terms",
    "/privacy",
    "/article",
    "/leaderboard",
    "/invoice",
  ];

  let productSlugs: string[] = [];
  try {
    // Try to fetch product slugs from API
    const res = await fetch("/api/v1/products/list?limit=100&fields=slug");
    if (res.ok) {
      const json = await res.json();
      productSlugs = json.items?.map((p: any) => p.slug).filter(Boolean) || [];
    }
  } catch {
    // ignore, fallback to static only
  }

  const pages = [
    ...staticPages.map((path) => ({
      loc: `${BASE_URL}${path}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "daily" as const,
      priority: path === "" ? 1.0 : 0.8,
    })),
    ...productSlugs.map((slug) => ({
      loc: `${BASE_URL}/${slug}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.6,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};