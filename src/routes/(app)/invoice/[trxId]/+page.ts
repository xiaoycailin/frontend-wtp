import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const prerender = false; // ← harus false karena data dinamis per trxId

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch("/api/v1/transactions/history/" + params.trxId);

  if (!res.ok) {
    // 404 → invoice tidak ditemukan, 5xx → server error
    redirect(302, `/invoice?error=${res.status}`);
  }

  const result = await res.json();

  if (!result?.data) {
    redirect(302, "/invoice?error=not_found");
  }

  return result.data;
};
