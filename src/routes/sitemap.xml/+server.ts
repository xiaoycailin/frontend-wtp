import type { RequestHandler } from "./$types";
import config from "../../config";

let BASE_URL = "https://topupin.store";

export const GET: RequestHandler = async ({ fetch }) => {
  const staticPages = [
    "",
    "/auth/login",
    "/auth/register",
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
    const res = await fetch(config.API_BASE_URL + "/category");
    if (res.ok) {
      const json = await res.json();
      // console.log(json.data);
      const slugs: any[] = [];
      json.data?.map((c: any) => {
        c.subCategories?.map((sub: any) => {
          slugs.push(sub.slug);
        });
      });
      productSlugs = slugs?.filter(Boolean);
    }
    const res2 = await fetch(config.API_BASE_URL + "/site-config");
    if (res2.ok) {
      const json2 = await res2.json();
      // console.log(json2.data);
      BASE_URL = json2?.data?.siteUrl ?? "https://topupin.store";
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
  </url>`,
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
