// src/routes/admin/categories/+page.server.ts
import config from "../../../../config";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, cookies}) => {
  try {
    const res = await fetch(config.API_BASE_URL+"/payments/available", {
      headers: {
        Authorization: "Bearer " + cookies.get("wtpanjay_token"),
      },
    });
    const json = await res.json();

    if (!res.ok) {
      return {
        payments: [],
        error: json?.data?.message ?? "Gagal memuat payments",
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
      error: "Terjadi kesalahan saat memuat payments",
    };
  }
};
