import { defineConfig } from "vite";
import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  root: "src",
  plugins: [vue()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    minify: true,
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    hmr: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "$lib": resolve(__dirname, "src/lib"),
    },
  },
});
