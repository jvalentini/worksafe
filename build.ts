import { build } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Use Vite for building (standard for Svelte projects)
await build({
  configFile: resolve(__dirname, "vite.config.ts"),
  mode: "production",
});

// Copy _redirects file if it exists
const redirects = Bun.file("./src/_redirects");
if (await redirects.exists()) {
  const distDir = resolve(__dirname, "dist");
  await Bun.write(resolve(distDir, "_redirects"), redirects);
  console.log("✓ Copied _redirects file");
}
