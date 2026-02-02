import type { ToolDefinition } from "../shared/types.ts";
import type { ToolHandler } from "./shared.ts";
import { getAppState } from "./shared.ts";

// =============================================================================
// play_music - Start playback
// =============================================================================

export const playMusicDefinition: ToolDefinition = {
  name: "play_music",
  description: "Start playback of the current pattern",
  parameters: {
    type: "object",
    properties: {},
  },
};

export const playMusicTool: ToolHandler = async () => {
  const state = getAppState();
  state.isPlaying = true;

  state.broadcast({
    type: "transport_control",
    action: "play",
  });

  return {
    id: "play_music",
    output: "Playback started",
  };
};

// =============================================================================
// stop_music - Stop playback (hush)
// =============================================================================

export const stopMusicDefinition: ToolDefinition = {
  name: "stop_music",
  description: "Stop playback (hush all sounds)",
  parameters: {
    type: "object",
    properties: {},
  },
};

export const stopMusicTool: ToolHandler = async () => {
  const state = getAppState();
  state.isPlaying = false;

  state.broadcast({
    type: "transport_control",
    action: "stop",
  });

  return {
    id: "stop_music",
    output: "Playback stopped",
  };
};

// =============================================================================
// strudel_evaluate - Evaluate/run the current pattern
// =============================================================================

export const strudelEvaluateDefinition: ToolDefinition = {
  name: "strudel_evaluate",
  description: "Evaluate and start playing the current pattern in the editor",
  parameters: {
    type: "object",
    properties: {},
  },
};

export const strudelEvaluateTool: ToolHandler = async () => {
  const state = getAppState();
  state.isPlaying = true;

  // Send evaluate command - frontend will evaluate current code and play
  state.broadcast({
    type: "transport_control",
    action: "play",
  });

  return {
    id: "strudel_evaluate",
    output: `Evaluating pattern: ${state.currentPattern.slice(0, 100)}${state.currentPattern.length > 100 ? "..." : ""}`,
  };
};
