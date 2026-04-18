import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import config from "../../../../config";

export const load: PageServerLoad = async ({ locals, cookies }) => {
  try {
    // Fetch articles
    const response = await fetch(
      `${config.API_BASE_URL}/articles?page=1&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${cookies.get("wtpanjay_token")}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw error(response.status, "Failed to fetch articles");
    }

    const data = await response.json();

    return {
      articles: data.data?.items || [],
      total: data.data?.meta?.total || 0,
    };
  } catch (e) {
    console.error("Error loading articles:", e);
    throw error(500, "Internal server error");
  }
};
