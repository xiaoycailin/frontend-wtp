import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
  const res = await fetch("/api/v1/site-config");
  const json = await res.json();
  const res1 = await fetch("/api/v1/users/self", {
    headers: {
      Authorization: "Bearer " + cookies.get("wtpanjay_token"),
    },
  });
  const json1 = await res1.json();
  console.log(json1);

  if (res1.status !== 200 || json1.data.role === "buyer") {
    redirect(302, "/");
  }

  return {
    siteConfig: json?.data ?? null,
    user: json1.data,
    token: cookies.get("wtpanjay_token"),
  };
};
