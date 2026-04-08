import type { LayoutLoad } from "./$types";

// src/routes/+layout.ts
export const load: LayoutLoad = async ({ fetch, data }) => {
  const res = await fetch("/api/v1/site-config");
  const json = await res.json();

  return {
    siteConfig: json?.data ?? null,
  };
};
