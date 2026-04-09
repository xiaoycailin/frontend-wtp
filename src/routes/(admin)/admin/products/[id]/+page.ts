import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
  const [productRes, categoryRes] = await Promise.all([
    fetch(`/api/v1/products/${params.id}`),
    fetch("/api/v1/category").catch(() => null),
  ]);

  const productJson = await productRes.json();
  const categoryJson = categoryRes ? await categoryRes.json().catch(() => ({})) : {};

  if (!productRes.ok) {
    throw new Error(productJson?.data?.message ?? "Gagal memuat produk");
  }

  return {
    product: productJson?.data,
    categories: categoryRes?.ok ? (categoryJson?.data ?? []) : [],
  };
};
