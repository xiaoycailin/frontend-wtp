import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  try {
    // Fetch directly from backend (server-side fetch cannot use Vite proxy)
    const res = await fetch("http://localhost:3000/site-config");
    if (!res.ok) {
      console.error("Failed to fetch site-config:", res.status);
      return { siteConfig: {} };
    }
    const json = await res.json();
    return { siteConfig: json?.data ?? {} };
  } catch (err) {
    console.error("Error fetching site-config:", err);
    return { siteConfig: {} };
  }
};
