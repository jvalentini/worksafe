import { describe, expect, test } from "bun:test";

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

describe("e2e", () => {
  test("dev server serves app HTML, assets, and HMR websocket", async () => {
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
