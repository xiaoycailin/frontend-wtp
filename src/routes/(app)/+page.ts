// since there's no dynamic data here, we can prerender

import type { PageLoad } from "./$types";
import { building } from "$app/environment";

// it so that it gets served as a static asset in production
// export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
  if (building) {
    return { category: [], banners: [] };
  }

  try {
    const [categoryRes, bannerRes] = await Promise.all([
      fetch("/api/v1/category?productInclude=true"),
      fetch("/api/v1/banners?type=banner"),
    ]);

    let category = [];
    let banners = [];

    if (categoryRes.ok) {
      const raw = await categoryRes.text();
      const result = JSON.parse(raw);
      category = result?.data ?? [];
    }

    if (bannerRes.ok) {
      const raw = await bannerRes.text();
      const result = JSON.parse(raw);
      banners = result?.data ?? [];
    }

    return {
      category,
      banners,
    };
  } catch {
    return {
      category: [],
      banners: [],
    };
  }
};
