import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  try {
    const res = await fetch("/api/v1/category");
    const json = await res.json().catch(() => ({}));

    return {
      categories: res.ok ? (json?.data ?? []) : [],
    };
  } catch {
    return {
      categories: [],
    };
  }
};
