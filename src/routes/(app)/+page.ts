// since there's no dynamic data here, we can prerender

import type { PageLoad } from "./$types";

// it so that it gets served as a static asset in production
export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
  try {
    const category = await fetch("/api/v1/category");
    if (!category.ok) {
      return { category: [] };
    }

    const raw = await category.text();
    const result = JSON.parse(raw);

    return {
      category: result?.data ?? [],
    };
  } catch {
    return {
      category: [],
    };
  }
};
