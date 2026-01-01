const port = Number(Bun.env.PORT ?? 3000);
const isDev = Bun.env.NODE_ENV !== "production";

if (isDev) {
  const { default: index } = await import("./index.html");

  const server = Bun.serve({
    port,
    routes: {
      "/*": index,
    },
    development: {
      hmr: true,
      console: true,
    },
  });

  console.log(`WorkSafe running at ${server.url}`);
} else {
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

      if (pathname.includes("\0") || pathname.includes("..")) {
        return new Response("Bad Request", { status: 400 });
      }

      if (pathname === "/") {
        pathname = "/index.html";
      }

      const fileUrl = new URL(`.${pathname}`, distDir);
      const file = Bun.file(fileUrl);

      if (await file.exists()) {
        return new Response(file);
      }

      const indexFile = Bun.file(indexFileUrl);
      if (await indexFile.exists()) {
        return new Response(indexFile);
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`WorkSafe running at ${server.url}`);
}
