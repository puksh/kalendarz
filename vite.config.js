import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    minify: "esbuild",
    target: "esnext",
    chunkSizeWarningLimit: 600,
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "./assets/main.css";`,
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://mc.kot.li:3000/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
