// src/routes/admin/categories/+page.server.ts
import type { PageServerLoad } from "./$types";
import { building } from "$app/environment";

export const load: PageServerLoad = async ({ fetch }) => {
  // Skip fetch during prerender/building to avoid 404 errors
  if (building) {
    return {
      categories: [],
      error: null,
    };
  }

  try {
    const res = await fetch("/api/v1/category");
    const json = await res.json();

    if (!res.ok) {
      return {
        categories: [],
        error: json?.data?.message ?? "Gagal memuat kategori",
      };
    }

    // backend kamu kirim data di field `data`
    return {
      categories: json.data ?? [],
      error: null,
    };
  } catch (e) {
    return {
      categories: [],
      error: "Terjadi kesalahan saat memuat kategori",
    };
  }
};
