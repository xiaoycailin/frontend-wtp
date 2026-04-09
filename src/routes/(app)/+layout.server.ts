import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
  try {
    // During prerender, this fetch will fail because backend is not running.
    // We'll catch and return null.
    const res = await fetch('/api/v1/site-config');
    if (!res.ok) {
      return { siteConfig: null };
    }
    const text = await res.text();
    if (!text) {
      return { siteConfig: null };
    }
    const json = JSON.parse(text);
    return { siteConfig: json?.data ?? null };
  } catch {
    return { siteConfig: null };
  }
};