import type { ToolDefinition } from "../shared/types.ts";
import type { ToolHandler } from "./shared.ts";
import { getAppState } from "./shared.ts";

// =============================================================================
// set_tempo - Adjust cycles per second
// =============================================================================

export const setTempoDefinition: ToolDefinition = {
  name: "set_tempo",
  description: "Set the tempo in cycles per second (cps). 1 cps = 120 BPM equivalent for 4/4",
  parameters: {
    type: "object",
    properties: {
      cps: {
        type: "number",
        description: "Cycles per second (typically 0.25 to 2.0). 0.5 is a moderate tempo.",
      },
    },
    required: ["cps"],
  },
};

export const setTempoTool: ToolHandler = async (args) => {
  const cps = args.cps as number;

  // Validate range
  if (cps < 0.05 || cps > 4) {
    return {
      id: "set_tempo",
      output: `Error: CPS should be between 0.05 and 4.0. Got: ${cps}`,
      error: true,
    };
  }

  const state = getAppState();
  state.cps = cps;

  state.broadcast({
    type: "set_cps",
    cps,
  });

  // Calculate approximate BPM for reference (assuming 4 beats per cycle)
  const bpm = Math.round(cps * 60 * 4);

  return {
    id: "set_tempo",
    output: `Tempo set to ${cps} cps (~${bpm} BPM)`,
  };
};
