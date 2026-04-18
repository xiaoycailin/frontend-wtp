import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  try {
    // Check if user is admin
    if (!locals.user?.id) {
      throw error(401, "Unauthorized");
    }

    const jwtToken = locals.auth.jwt;
    
    if (!jwtToken) {
      throw error(401, "No JWT token found");
    }

    // Fetch articles
    const response = await fetch(`http://192.168.18.217:3000/articles?page=1&limit=50`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

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
