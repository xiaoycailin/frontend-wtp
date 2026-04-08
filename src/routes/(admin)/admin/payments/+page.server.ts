// src/routes/admin/categories/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  try {
    const res = await fetch("/api/v1/payments/available", {
      headers: {
        Authorization: "Bearer " + cookies.get("wtpanjay_token"),
      },
    });
    const json = await res.json();

    if (!res.ok) {
      return {
        payments: [],
        error: json?.data?.message ?? "Gagal memuat kategori",
      };
    }

    // backend kamu kirim data di field `data`
    return {
      payments: json.data ?? [],
      error: null,
    };
  } catch (e) {
    return {
      payments: [],
      error: "Terjadi kesalahan saat memuat kategori",
    };
  }
};
