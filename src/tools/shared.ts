import type { ToolResult } from "../shared/types.ts";

export type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

/**
 * Shared state for tools that need to communicate with the frontend
 */
export interface AppState {
  currentPattern: string;
  isPlaying: boolean;
  cps: number;
  broadcast: (message: unknown) => void;
}

let appState: AppState | null = null;

export function setAppState(state: AppState): void {
  appState = state;
}

export function getAppState(): AppState {
  if (!appState) {
    throw new Error("App state not initialized");
  }
  return appState;
}

/**
 * Truncate output to a maximum number of bytes
 */
export function truncateOutput(body: string, maxBytes: number): string {
  if (Buffer.byteLength(body, "utf8") <= maxBytes) {
    return body;
  }
  let truncated = body;
  while (Buffer.byteLength(truncated, "utf8") > maxBytes - 20) {
    truncated = truncated.slice(0, -100);
  }
  return truncated + "\n[truncated]";
}

/**
 * Read environment variable as integer with fallback
 */
export function envInt(name: string, fallback: number): number {
  const val = process.env[name];
  if (!val) return fallback;
  const parsed = Number.parseInt(val, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
