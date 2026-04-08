// src/routes/admin/products/[id]/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const id = params.id;

  const res = await fetch(`/api/v1/products/list?id=${id}`);
  const json = await res.json();

  if (!res.ok) {
    return {
      product: null,
      error: json?.data?.message ?? "Produk tidak ditemukan",
    };
  }

  return {
    product: json.data.items[0],
  };
};
