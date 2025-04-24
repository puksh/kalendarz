import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import autoprefixer from "autoprefixer";

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
      output: {
        // Code splitting
        manualChunks: {
          "vue-vendor": ["vue"],
          "crypto-vendor": ["crypto-js"],
          utils: ["./src/utils/dataSync.js"],
        },
        // Disable automatic preloading
        modulePreload: {
          polyfill: false,
        },
      },
    },
    assetsInlineLimit: 4096, // 4kb
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "./assets/main.css";@import "./assets/iphone.css";`,
      },
    },
    postcss: {
      plugins: [autoprefixer],
    },
  },
  optimizeDeps: {
    // Only preload what's needed immediately
    entries: ["./src/main.js"],
  },
  // Server config for dev
  server: {
    open: true,
    cors: true,
    host: true,
    port: 5173,
  },
  esbuild: {
    legalComments: "none",
    drop: ["console", "debugger"],
  },
});
