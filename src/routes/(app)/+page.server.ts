// since there's no dynamic data here, we can prerender

import type { PageServerLoad } from "./$types";
import { building } from "$app/environment";
import config from "../../config";

// it so that it gets served as a static asset in production
// export const prerender = true;

export const load: PageServerLoad = async ({ fetch }) => {
  if (building) {
    return { category: [], banners: [] };
  }

  try {
    const [categoryRes, bannerRes] = await Promise.all([
      fetch(config.API_BASE_URL + "/category?productInclude=true"),
      fetch(config.API_BASE_URL + "/banners?type=banner"),
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
