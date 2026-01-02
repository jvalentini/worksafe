/**
 * Server for serving the app in both development and production modes.
 * In development mode, uses Bun's dev server with HMR.
 * In production mode, serves static files from dist/.
 */
export interface StartServerOptions {
  port?: number;
  log?: boolean;
  development?: boolean;
}

export async function startServer(
  options: StartServerOptions = {},
): Promise<ReturnType<typeof Bun.serve>> {
  const port = options.port ?? Number(Bun.env.PORT ?? 3000);
  const log = options.log ?? true;

  // Determine if we're in development mode
  const distDir = new URL("../dist/", import.meta.url);
  const distExists = await Bun.file(new URL("./index.html", distDir)).exists();
  const isDevelopment =
    options.development ?? (Bun.env.NODE_ENV !== "production" && !distExists);

  if (isDevelopment) {
    // Development mode: use Bun's dev server with HMR
    const srcDir = new URL("./", import.meta.url);
    const indexFileUrl = new URL("./index.html", srcDir);

    const server = Bun.serve({
      port,
      development: {
        hmr: true,
      },
      async fetch(req) {
        const url = new URL(req.url);

        let pathname: string;
        try {
          pathname = decodeURIComponent(url.pathname);
        } catch {
          return new Response("Bad Request", { status: 400 });
        }

        // Security: prevent path traversal
        if (pathname.includes("\0") || pathname.includes("..")) {
          return new Response("Bad Request", { status: 400 });
        }

        // Serve index.html for root
        if (pathname === "/") {
          const indexFile = Bun.file(indexFileUrl);
          if (await indexFile.exists()) {
            return new Response(indexFile);
          }
        }

        // Let Bun handle other requests (assets, HMR, etc.)
        const fileUrl = new URL(`.${pathname}`, srcDir);
        const file = Bun.file(fileUrl);
        if (await file.exists()) {
          return new Response(file);
        }

        return new Response("Not Found", { status: 404 });
      },
    });

    if (log) {
      console.log(`WorkSafe (dev) running at ${server.url}`);
    }

    return server;
  }

  // Production mode: serve from dist/
  const indexFileUrl = new URL("./index.html", distDir);

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      let pathname: string;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return new Response("Bad Request", { status: 400 });
      }

      // Security: prevent path traversal
      if (pathname.includes("\0") || pathname.includes("..")) {
        return new Response("Bad Request", { status: 400 });
      }

      // In production, explicitly block /_bun/* paths
      if (pathname.startsWith("/_bun/")) {
        return new Response("Not Found", { status: 404 });
      }

      const isAssetRequest =
        pathname !== "/" && pathname.split("/").pop()?.includes(".");

      // Serve index.html for root and non-asset requests (SPA routing)
      if (pathname === "/") {
        pathname = "/index.html";
      }

      const fileUrl = new URL(`.${pathname}`, distDir);
      const file = Bun.file(fileUrl);

      if (await file.exists()) {
        return new Response(file);
      }

      // If it was an asset request and not found, return 404
      if (isAssetRequest) {
        return new Response("Not Found", { status: 404 });
      }

      // For SPA routing, serve index.html for non-asset requests
      const indexFile = Bun.file(indexFileUrl);
      if (await indexFile.exists()) {
        return new Response(indexFile);
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  if (log) {
    console.log(`WorkSafe (prod) running at ${server.url}`);
  }

  return server;
}

if (import.meta.main) {
  await startServer();
}
