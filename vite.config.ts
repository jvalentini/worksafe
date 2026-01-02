import { defineConfig } from "vite";
import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  root: "src",
  plugins: [
    svelte({
      configFile: resolve(__dirname, "svelte.config.js"),
    }),
  ],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // Optimize for production
    minify: true,
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    // Enable HMR
    hmr: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "$lib": resolve(__dirname, "src/lib"),
    },
  },
});
