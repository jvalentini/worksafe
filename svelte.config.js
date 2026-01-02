import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Enable runes for Svelte 5
    runes: true,
    // Enable HMR (Svelte 5 has HMR integrated)
    hmr: true,
  },
};

export default config;
