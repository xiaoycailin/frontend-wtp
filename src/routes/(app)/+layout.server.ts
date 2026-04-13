import { redirect } from "@sveltejs/kit";
import { building } from "$app/environment";
import config from "../../config";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
  // Skip fetch during prerender/building to avoid 404 errors
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

    // console.log("Site RES", siteRes.ok);

    const siteJson = siteRes.ok ? await siteRes.json().catch(() => ({})) : {};
    const userJson = userRes.ok ? await userRes.json().catch(() => ({})) : {};

    // If user is not admin, redirect
    // if (!userRes.ok || userJson?.data?.role === "buyer") {
    //   redirect(302, "/");
    // }

    return {
      siteConfig: siteJson?.data ?? null,
      user: userJson.data ?? null,
      token: cookies.get("wtpanjay_token"),
    };
  } catch (error) {
    // If any error, still return safe fallback (no redirect during build)
    return {
      siteConfig: null,
      user: null,
      token: null,
    };
  }
};
