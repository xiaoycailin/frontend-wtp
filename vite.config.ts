import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    VitePWA({
      registerType: "autoUpdate",

      injectRegister: "script",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "TopupIn",
        short_name: "TopupIn",
        description: "Platform digital topup terpercaya",
        theme_color: "#141414",

        background_color: "#0d0d0d",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,ico,png,svg,webp}"],
        navigateFallbackDenylist: [/^\/api/], // ← jangan fallback untuk API calls
        navigateFallback: null,
        // globDirectory: "build/prerendered",
        cleanupOutdatedCaches: true,
        // additionalManifestEntries: [
        //   { url: "/offline", revision: "1" }, // ← precache halaman offline
        // ],

        runtimeCaching: [
          {
            // Handle offline fallback manual
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              networkTimeoutSeconds: 10,
              plugins: [
                {
                  handlerDidError: async () => {
                    return caches.match("/offline") as Promise<Response>;
                  },
                },
              ],
            },
          },
          {
            // Cache gambar produk/banner
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst", // utamakan cache
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 hari
              },
            },
          },
        ],
      },
    }),
  ],
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
