import type { ServerWebSocket } from "bun";
import { runAgent } from "../agent/index.ts";
import type { ClientMessage, ServerMessage } from "../shared/types.ts";

export interface WebSocketData {
  id: string;
}

// Connected clients
const clients = new Map<string, ServerWebSocket<WebSocketData>>();

// Shared state
let currentPattern = `// Welcome to Apfelstrudel! 🥧
// Type a pattern and press Play, or ask the AI for help

s("bd sd").bank("RolandTR808")`;
let isPlaying = false;
let cps = 0.5;

/**
 * Broadcast a message to all connected clients
 */
export function broadcast(message: ServerMessage): void {
  const json = JSON.stringify(message);
  for (const client of clients.values()) {
    client.send(json);
  }
}

/**
 * Get current app state
 */
export function getState() {
  return { pattern: currentPattern, playing: isPlaying, cps };
}

/**
 * WebSocket handlers for Bun.serve
 */
export const websocketHandlers = {
  open(ws: ServerWebSocket<WebSocketData>) {
    const id = crypto.randomUUID();
    ws.data = { id };
    clients.set(id, ws);
    console.log(`[WS] Client connected: ${id}`);

    // Send current state to new client
    const syncMessage: ServerMessage = {
      type: "sync_state",
      pattern: currentPattern,
      playing: isPlaying,
      cps,
    };
    ws.send(JSON.stringify(syncMessage));
  },

  close(ws: ServerWebSocket<WebSocketData>) {
    const id = ws.data.id;
    clients.delete(id);
    console.log(`[WS] Client disconnected: ${id}`);
  },

  async message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    try {
      const data = JSON.parse(message.toString()) as ClientMessage;
      console.log(`[WS] Received:`, data.type);

      switch (data.type) {
        case "chat":
          await handleChat(data.message);
          break;

        case "pattern_update":
          currentPattern = data.code;
          // Broadcast to other clients
          broadcast({ type: "set_pattern", code: data.code });
          break;

        case "transport":
          isPlaying = data.action === "play";
          broadcast({ type: "transport_control", action: data.action });
          break;

        case "sync_request":
          ws.send(
            JSON.stringify({
              type: "sync_state",
              pattern: currentPattern,
              playing: isPlaying,
              cps,
            } satisfies ServerMessage)
          );
          break;

        default:
          console.log(`[WS] Unknown message type:`, data);
      }
    } catch (err) {
      console.error(`[WS] Error processing message:`, err);
      ws.send(
        JSON.stringify({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        } satisfies ServerMessage)
      );
    }
  },
};

/**
 * Handle incoming chat message from user
 */
async function handleChat(userMessage: string): Promise<void> {
  const provider = process.env.APFELSTRUDEL_PROVIDER ?? "openai";
  const model = process.env.APFELSTRUDEL_MODEL ?? "gpt-4o-mini";
  const maxSteps = Number.parseInt(process.env.APFELSTRUDEL_MAX_STEPS ?? "16", 10);
  const timeoutMs = Number.parseInt(process.env.APFELSTRUDEL_TIMEOUT_MS ?? "30000", 10);

  try {
    await runAgent(userMessage, {
      provider,
      model,
      maxSteps,
      requestTimeoutMs: timeoutMs,
      broadcast,
      getState,
    });
  } catch (err) {
    console.error(`[Agent] Error:`, err);
    broadcast({
      type: "error",
      message: err instanceof Error ? err.message : "Agent error",
    });
  }
}

/**
 * Update pattern from tool
 */
export function setPattern(code: string): void {
  currentPattern = code;
}

/**
 * Update transport state from tool
 */
export function setPlaying(playing: boolean): void {
  isPlaying = playing;
}

/**
 * Update tempo from tool
 */
export function setCps(newCps: number): void {
  cps = newCps;
}
