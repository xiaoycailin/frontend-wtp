import { redirect, error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { building } from "$app/environment";
import config from "../../config";

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
  if (building) {
    return {
      siteConfig: null,
      user: null,
      token: null,
    };
  }

  try {
    const [siteRes, userRes] = await Promise.all([
      fetch(config.API_BASE_URL + "/site-config").catch(() => ({ ok: false })),
      fetch(config.API_BASE_URL + "/users/self", {
        headers: {
          Authorization: "Bearer " + cookies.get("wtpanjay_token"),
        },
      }).catch(() => ({ ok: false })),
    ]);

    const siteJson = siteRes.ok ? await siteRes.json().catch(() => ({})) : {};
    const userJson = userRes.ok ? await userRes.json().catch(() => ({})) : {};

    // ❌ kalau user request gagal → 404
    if (!userRes.ok) {
      throw error(404, "User not found");
    }

    // ❌ kalau role buyer → 404
    if (userJson?.data?.role === "buyer") {
      throw error(404, "Page not found");
    }

    return {
      siteConfig: siteJson?.data ?? null,
      user: userJson.data ?? null,
      token: cookies.get("wtpanjay_token"),
    };
  } catch (err) {
    throw error(404, "Page not found");
  }
};
