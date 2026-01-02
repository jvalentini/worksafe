import { compile } from "svelte/compiler";

export interface SvelteLoaderOptions {
  development: boolean;
}

export function createSvelteLoader(
  options: SvelteLoaderOptions,
): Bun.BunPlugin {
  return {
    name: "worksafe-svelte-loader",
    setup(builder) {
      builder.onLoad({ filter: /\.svelte$/ }, async (args) => {
        const { readFileSync } = await import("node:fs");

        const cleanPath = args.path;

        console.log("Compiling Svelte component:", cleanPath);

        try {
          const source = readFileSync(cleanPath, "utf-8");
          const result = compile(source, {
            filename: cleanPath,
            generate: "client",
            dev: options.development,
            css: "injected",
          });

          console.log("Compilation result:", result.js.code.slice(0, 200));

          if (options.development) {
            for (const warning of result.warnings) {
              console.warn(
                `${warning.filename ?? cleanPath}: ${warning.message}`,
                warning,
              );
            }
          }

          return {
            contents: result.js.code,
            loader: "js",
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error("Svelte compilation error:", message);
          throw new Error(
            `Failed to compile Svelte component (${cleanPath}): ${message}`,
          );
        }
      });
    },
  };
}

let svelteLoaderRegistered = false;

export function registerSvelteLoader(options: SvelteLoaderOptions): void {
  if (svelteLoaderRegistered) return;
  svelteLoaderRegistered = true;

  Bun.plugin(createSvelteLoader(options));
}
