import { websocketHandlers } from "./websocket.ts";

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);

/**
 * Main Bun server with HTTP + WebSocket support
 */
const server = Bun.serve({
  port: PORT,

  async fetch(req, server) {
    const url = new URL(req.url);

    // Upgrade WebSocket requests
    if (url.pathname === "/ws") {
      const success = server.upgrade(req, {
        data: { id: "" },
      });
      return success
        ? undefined
        : new Response("WebSocket upgrade failed", { status: 500 });
    }

    // Serve static files from public/
    let path = url.pathname;
    if (path === "/") path = "/index.html";

    const filePath = `./public${path}`;
    const file = Bun.file(filePath);

    if (await file.exists()) {
      // Set content type based on extension
      const contentType = getContentType(path);
      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    }

    // 404 for unknown paths
    return new Response("Not Found", { status: 404 });
  },

  websocket: websocketHandlers,
});

/**
 * Get MIME type for file extension
 */
function getContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "html":
      return "text/html; charset=utf-8";
    case "css":
      return "text/css; charset=utf-8";
    case "js":
    case "mjs":
      return "text/javascript; charset=utf-8";
    case "json":
      return "application/json";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    case "wav":
      return "audio/wav";
    case "mp3":
      return "audio/mpeg";
    case "ogg":
      return "audio/ogg";
    case "ttf":
      return "font/ttf";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

console.log(`
╭───────────────────────────────────────────────────╮
│                                                   │
│   🥧 Apfelstrudel                                 │
│   Live coding music with AI assistance            │
│                                                   │
│   Server running at: http://localhost:${PORT}       │
│   WebSocket at:      ws://localhost:${PORT}/ws      │
│                                                   │
╰───────────────────────────────────────────────────╯
`);
