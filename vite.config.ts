import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    allowedHosts: true,
    host: true,
    port: 4173,
    proxy: {
      "/api/v1": {
        // target: "https://gateway.weebin.site",
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ""),
      },
    },
  },
  preview: {
    allowedHosts: true,
    host: true, // 🔥 INI PENTING
    port: 4173,
    proxy: {
      "/api/v1": {
        // target: "https://gateway.weebin.site",
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ""),
      },
    },
  },
});
