import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

import { startServer } from "../server";

async function openWebSocket(url: string, timeoutMs = 2000): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(url);

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error(`Timed out connecting to ${url}`));
    }, timeoutMs);

    ws.onopen = () => {
      clearTimeout(timeout);
      ws.close();
      resolve();
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`WebSocket connection failed: ${url}`));
    };
  });
}

describe("e2e dev server", () => {
  test("serves app HTML, assets, and HMR websocket", async () => {
    const server = await startServer({ mode: "dev", port: 0, log: false });

    try {
      const baseUrl = new URL(String(server.url));

      const indexResponse = await fetch(baseUrl);
      expect(indexResponse.ok).toBe(true);

      const html = await indexResponse.text();
      expect(html).toContain('id="text-input"');
      expect(html).toContain('id="transform-btn"');

      const assetPaths = new Set<string>();
      for (const match of html.matchAll(
        /(?:href|src)="(\/_bun\/asset\/[^"]+)"/g,
      )) {
        if (match[1]) assetPaths.add(match[1]);
      }

      expect(assetPaths.size).toBeGreaterThan(0);

      for (const assetPath of assetPaths) {
        const assetUrl = new URL(assetPath, baseUrl);
        const assetResponse = await fetch(assetUrl);
        expect(assetResponse.ok).toBe(true);
      }

      const wsUrl = new URL("/_bun/hmr", baseUrl);
      wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";

      await openWebSocket(wsUrl.href);
    } finally {
      server.stop(true);
    }
  });
});

describe("e2e prod server", () => {
  const distDir = join(import.meta.dirname, "../../dist");

  beforeAll(async () => {
    // Build the project before running prod tests
    const result = Bun.spawnSync(["bun", "run", "build"], {
      cwd: join(import.meta.dirname, "../.."),
      stdout: "pipe",
      stderr: "pipe",
    });

    if (result.exitCode !== 0) {
      throw new Error(`Build failed: ${result.stderr.toString()}`);
    }
  });

  afterAll(() => {
    // Clean up dist directory after tests
    if (existsSync(distDir)) {
      rmSync(distDir, { recursive: true });
    }
  });

  test("serves static HTML and assets from dist/", async () => {
    const server = await startServer({ mode: "prod", port: 0, log: false });

    try {
      const baseUrl = new URL(String(server.url));

      const indexResponse = await fetch(baseUrl);
      expect(indexResponse.ok).toBe(true);

      const html = await indexResponse.text();
      expect(html).toContain('id="text-input"');
      expect(html).toContain('id="transform-btn"');

      const assetPaths = new Set<string>();
      for (const match of html.matchAll(
        /(?:href|src)="([^"]+\.(?:js|css))"/g,
      )) {
        if (match[1]) assetPaths.add(match[1]);
      }

      expect(assetPaths.size).toBeGreaterThan(0);

      for (const assetPath of assetPaths) {
        const assetUrl = new URL(assetPath, baseUrl);
        const assetResponse = await fetch(assetUrl);
        expect(assetResponse.ok).toBe(true);
      }
    } finally {
      server.stop(true);
    }
  });

  test("returns 404 for /_bun/* paths", async () => {
    const server = await startServer({ mode: "prod", port: 0, log: false });

    try {
      const baseUrl = new URL(String(server.url));
      const bunPath = new URL("/_bun/hmr", baseUrl);

      const response = await fetch(bunPath);
      expect(response.status).toBe(404);
    } finally {
      server.stop(true);
    }
  });

  test("returns 404 for missing assets", async () => {
    const server = await startServer({ mode: "prod", port: 0, log: false });

    try {
      const baseUrl = new URL(String(server.url));
      const missingAsset = new URL("/nonexistent-file.js", baseUrl);

      const response = await fetch(missingAsset);
      expect(response.status).toBe(404);
    } finally {
      server.stop(true);
    }
  });

  test("serves index.html for SPA routes", async () => {
    const server = await startServer({ mode: "prod", port: 0, log: false });

    try {
      const baseUrl = new URL(String(server.url));
      const spaRoute = new URL("/some/deep/route", baseUrl);

      const response = await fetch(spaRoute);
      expect(response.ok).toBe(true);

      const html = await response.text();
      expect(html).toContain('id="text-input"');
    } finally {
      server.stop(true);
    }
  });

  test("rejects null byte injection attempts", async () => {
    const server = await startServer({ mode: "prod", port: 0, log: false });

    try {
      const baseUrl = new URL(String(server.url));

      const nullBytePath = new URL("/index.html%00.js", baseUrl);
      const response = await fetch(nullBytePath);
      expect(response.status).toBe(400);
    } finally {
      server.stop(true);
    }
  });
});
