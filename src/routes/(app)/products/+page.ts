import type { PageLoad } from "./$types";
import { building } from "$app/environment";

export const load: PageLoad = async ({ fetch }) => {
  if (building) {
    return { categories: [] };
  }

  try {
    const res = await fetch("/api/v1/category");
    if (!res.ok) {
      return { categories: [] };
    }
    const json = await res.json();
    return { categories: json?.data ?? [] };
  } catch {
    return { categories: [] };
  }
};