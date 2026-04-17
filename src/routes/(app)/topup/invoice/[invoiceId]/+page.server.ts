import { error } from "@sveltejs/kit";
import config from "../../../../../config.js";

export async function load({ params, fetch, cookies }) {
  const res = await fetch(
    config.API_BASE_URL + "/users/balance-topups/" + params.invoiceId,
    {
      headers: {
        Authorization: "Bearer " + cookies.get("wtpanjay_token"),
      },
    },
  );
  if (!res.ok) throw error(404, "Invoice topup tidak ditemukan");

  const items = await res.json();
  // console.log(items);
  const topup = items.data;
  if (!topup) throw error(404, "Invoice topup tidak ditemukan");
  return { topup };
}
