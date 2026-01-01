export type ServerMode = "dev" | "prod";

export interface StartServerOptions {
  port?: number;
  mode?: ServerMode;
  log?: boolean;
}

export async function startServer(
  options: StartServerOptions = {},
): Promise<ReturnType<typeof Bun.serve>> {
  const port = options.port ?? Number(Bun.env.PORT ?? 3000);
  const mode: ServerMode =
    options.mode ?? (Bun.env.NODE_ENV === "production" ? "prod" : "dev");
  const log = options.log ?? true;

  const server =
    mode === "dev" ? await startDevServer(port) : await startProdServer(port);

  if (log) {
    console.log(`WorkSafe running at ${server.url}`);
  }

  return server;
}

async function startDevServer(
  port: number,
): Promise<ReturnType<typeof Bun.serve>> {
  const { default: index } = await import("./index.html");

  return Bun.serve({
    port,
    routes: {
      "/*": index,
    },
    development: {
      hmr: true,
      console: true,
    },
  });
}

async function startProdServer(
  port: number,
): Promise<ReturnType<typeof Bun.serve>> {
  const distDir = new URL("../dist/", import.meta.url);
  const indexFileUrl = new URL("./index.html", distDir);

  return Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      let pathname: string;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return new Response("Bad Request", { status: 400 });
      }

      if (pathname.startsWith("/_bun/")) {
        return new Response("Not Found", { status: 404 });
      }

      if (pathname.includes("\0") || pathname.includes("..")) {
        return new Response("Bad Request", { status: 400 });
      }

      const isAssetRequest =
        pathname !== "/" && pathname.split("/").pop()?.includes(".");

      if (pathname === "/") {
        pathname = "/index.html";
      }

      const fileUrl = new URL(`.${pathname}`, distDir);
      const file = Bun.file(fileUrl);

      if (await file.exists()) {
        return new Response(file);
      }

      if (isAssetRequest) {
        return new Response("Not Found", { status: 404 });
      }

      const indexFile = Bun.file(indexFileUrl);
      if (await indexFile.exists()) {
        return new Response(indexFile);
      }

      return new Response("Not Found", { status: 404 });
    },
  });
}

if (import.meta.main) {
  await startServer();
}
