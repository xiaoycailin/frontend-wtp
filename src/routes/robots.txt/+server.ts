import config from "../../config";
import type { RequestHandler } from "./$types";

let BASE_URL = "https://topupin.store";

export const GET: RequestHandler = async () => {
  const res2 = await fetch(config.API_BASE_URL + "/site-config");

  if (res2.ok) {
    const json2 = await res2.json();
    // console.log(json2.data);
    BASE_URL = json2?.data?.siteUrl ?? "https://topupin.store";
  }
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`;
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
