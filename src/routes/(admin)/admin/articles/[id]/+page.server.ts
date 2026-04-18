import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies }) => {
  // Check auth
  if (!cookies.get("wtpanjay_token")) {
    throw error(401, "Unauthorized");
  }

  return {};
};
