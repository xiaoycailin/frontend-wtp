// src/routes/admin/categories/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, cookies, params }) => {
  try {
    const res = await fetch("/api/v1/transactions/history/" + params.trxId, {
      headers: {
        Authorization: "Bearer " + cookies.get("wtpanjay_token"),
      },
    });
    const json = await res.json();

    if (!res.ok) {
      return {
        transaction: null,
        error: json?.data?.message ?? "Gagal memuat kategori",
      };
    }

    // backend kamu kirim data di field `data`
    return {
      transaction: json.data,
      error: null,
    };
  } catch (e) {
    return {
      transaction: null,
      error: "Terjadi kesalahan saat memuat kategori",
    };
  }
};
