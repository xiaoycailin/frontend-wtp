import type { PageLoad } from "./$types";
import { building } from "$app/environment";

export const load: PageLoad = async ({ fetch }) => {
  if (building) {
    return {
      categories: [],
    };
  }

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
