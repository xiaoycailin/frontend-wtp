// src/routes/admin/products/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, fetch, cookies }) => {
  // Ambil query dari URL
  const q = url.searchParams.get("q") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const sort = url.searchParams.get("sort") ?? "latest";
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const sub = url.searchParams.get("sub") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const id = url.searchParams.get("id") ?? "";

  // Build query string untuk backend
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (sub) params.set("sub", sub);
  if (status) params.set("status", status);
  if (id) params.set("id", id);

  const apiUrl = `/api/v1/products/list?${params.toString()}`;

  const res = await fetch(apiUrl, {
    headers: {
      Authorization: "Bearer " + cookies.get("wtpanjay_token"),
    },
  });
  const json = await res.json();

  if (!res.ok) {
    return {
      products: [],
      total: 0,
      page,
      limit,
      error: json?.data?.message ?? "Gagal memuat data produk",
    };
  }

  const data = json.data ?? {};

  return {
    products: data.items ?? [],
    total: data.total ?? 0,
    page: data.page ?? page,
    limit: data.limit ?? limit,
    q,
    category,
    sort,
    sub,
    status,
    id,
  };
};
