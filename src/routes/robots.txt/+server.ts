import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: https://wtpanjay.com/sitemap.xml
`;
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
};