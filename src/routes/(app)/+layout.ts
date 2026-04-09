import type { LayoutLoad } from "./$types";

// src/routes/+layout.ts
export const load: LayoutLoad = async ({ fetch }) => {
  try {
    const res = await fetch("/api/v1/site-config");

    if (!res.ok) {
      return {
        siteConfig: null,
      };
    }

    const text = await res.text();

    if (!text) {
      return {
        siteConfig: null,
      };
    }

    try {
      const json = JSON.parse(text);
      return {
        siteConfig: json?.data ?? null,
      };
    } catch {
      return {
        siteConfig: null,
      };
    }
  } catch {
    return {
      siteConfig: null,
    };
  }
};
