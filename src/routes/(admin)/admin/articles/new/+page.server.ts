import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
  // Check auth
  if (!locals.user?.id) {
    throw error(401, "Unauthorized");
  }

  return {};
};
