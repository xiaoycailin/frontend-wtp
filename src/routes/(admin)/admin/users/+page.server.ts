import config from "../../../../config";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, fetch, cookies }) => {
  const q = url.searchParams.get("q") ?? "";
  const role = url.searchParams.get("role") ?? "";
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "20");

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (role) params.set("role", role);
  params.set("page", String(page));
  params.set("limit", String(limit));

  try {
    const res = await fetch(
      `${config.API_BASE_URL}/users?${params.toString()}`,
      {
        headers: {
          Authorization: "Bearer " + cookies.get("wtpanjay_token"),
        },
      },
    );

    const json = await res.json();

    if (!res.ok) {
      return {
        users: [],
        meta: { total: 0, page, limit, totalPages: 1 },
        q,
        role,
        error: json?.data?.message ?? "Gagal memuat data pengguna",
      };
    }

    return {
      users: json?.data?.items ?? [],
      meta: json?.data?.meta ?? { total: 0, page, limit, totalPages: 1 },
      q,
      role,
      error: null,
    };
  } catch {
    return {
      users: [],
      meta: { total: 0, page, limit, totalPages: 1 },
      q,
      role,
      error: "Terjadi kesalahan saat memuat data pengguna",
    };
  }
};
