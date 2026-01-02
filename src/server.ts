/**
 * Production server for serving the built Vite app.
 * For development, use `bun run dev` which runs Vite dev server.
 */
export interface StartServerOptions {
  port?: number;
  log?: boolean;
}

export async function startServer(
  options: StartServerOptions = {},
): Promise<ReturnType<typeof Bun.serve>> {
  const port = options.port ?? Number(Bun.env.PORT ?? 3000);
  const log = options.log ?? true;

  const distDir = new URL("../dist/", import.meta.url);
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
    console.log(`WorkSafe running at ${server.url}`);
  }

  return server;
}

if (import.meta.main) {
  await startServer();
}
