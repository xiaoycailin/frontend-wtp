// src/routes/admin/categories/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  try {
    const res = await fetch("/api/v1/transactions/history", {
      headers: {
        Authorization: "Bearer " + cookies.get("wtpanjay_token"),
      },
    });
    const json = await res.json();

    if (!res.ok) {
      return {
        transactions: [],
        error: json?.data?.message ?? "Gagal memuat kategori",
      };
    }

    // backend kamu kirim data di field `data`
    return {
      transactions: json.data.items ?? [],
      meta: json.data.meta,
      error: null,
    };
  } catch (e) {
    return {
      transactions: [],
      error: "Terjadi kesalahan saat memuat kategori",
    };
  }
};
