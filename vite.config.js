import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    visualizer({
      filename: "stats.html",
      open: false,
      gzipSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    minify: "esbuild",
    target: "esnext",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      // Disable automatic preloading
      modulePreload: {
        polyfill: false,
      },
    },
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "./assets/main.css";`,
      },
    },
  },
  optimizeDeps: {
    // Only preload what's needed immediately
    entries: ["./src/main.js"],
  },
});
