import type { ToolDefinition } from "../shared/types.ts";
import type { ToolHandler } from "./shared.ts";

// =============================================================================
// get_strudel_help - Documentation helper
// =============================================================================

export const getStrudelHelpDefinition: ToolDefinition = {
  name: "get_strudel_help",
  description: "Get documentation for a strudel function or concept",
  parameters: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "Function name or concept (e.g., 'note', 's', 'jux', 'mini-notation', 'effects')",
      },
    },
    required: ["topic"],
  },
};

// Basic strudel documentation (embedded for quick reference)
const STRUDEL_DOCS: Record<string, string> = {
  s: `s("sound") - Play samples by name
Example: s("bd sd hh")
Common samples: bd, sd, hh, oh, cp, rim, tom, perc
Use .bank("name") to select sample banks like "RolandTR909"`,

  note: `note("pattern") - Play notes/pitches
Example: note("c4 e4 g4") or note("<c3 e3 g3>")
Supports note names (c4, d#5) and MIDI numbers
Chain with .sound("synth") to choose instrument`,

  n: `n("pattern") - Select sample variant number
Example: s("hh").n("0 1 2 3")
Most sample banks have multiple variants (0-indexed)`,

  bank: `.bank("name") - Select sample bank
Example: s("bd sd").bank("RolandTR909")
Popular banks: RolandTR909, RolandTR808, casio, jazz`,

  gain: `.gain(value) - Set volume (0-1)
Example: s("bd").gain(0.8)
Can also use patterns: .gain("0.5 0.8 0.3")`,

  speed: `.speed(value) - Playback speed
Example: s("bd").speed(2) // double speed, octave up
Negative values play backwards`,

  lpf: `.lpf(freq) - Low-pass filter
Example: s("bd").lpf(500) // cut highs above 500Hz
Use with patterns: .lpf(sine.range(200, 2000))`,

  hpf: `.hpf(freq) - High-pass filter
Example: s("hh").hpf(3000) // cut lows below 3000Hz`,

  delay: `.delay(amount) - Echo/delay effect
Example: s("cp").delay(0.5)
0 = no delay, 1 = full delay`,

  room: `.room(size) - Reverb
Example: s("sd").room(0.8)
0 = dry, 1 = very wet`,

  jux: `.jux(fn) - Apply function to right channel only
Example: s("bd sd").jux(rev) // reverse on right
Creates stereo width`,

  rev: `.rev() - Reverse the pattern
Example: note("c d e f").rev() // plays f e d c`,

  fast: `.fast(n) - Speed up pattern n times
Example: s("bd sd").fast(2) // twice as fast
.slow(n) does the opposite`,

  slow: `.slow(n) - Slow down pattern n times
Example: note("c d e f").slow(2) // half speed`,

  "mini-notation": `Mini-notation basics:
"bd sd" - sequence: kick then snare
"[bd sd]" - group: play together
"bd*4" - repeat: 4 times per cycle
"<bd sd>" - alternate: different each cycle
"bd, hh" - stack: layer together
"bd?" - random: 50% chance
"bd!3" - replicate: 3 copies
"bd@2" - elongate: takes 2 time units`,

  effects: `Common effect chains:
.gain(0.8) - volume
.lpf(2000) - low-pass filter
.hpf(200) - high-pass filter
.delay(0.3).delayfeedback(0.5) - echo
.room(0.5).size(0.8) - reverb
.pan(sine) - auto-pan
.speed(0.5) - half speed
.crush(4) - bit crush`,

  setcps: `setcps(n) - Set cycles per second (tempo)
Example: setcps(0.5) // 0.5 cycles per second
1 cps with 4/4 ≈ 120 BPM
Common values: 0.25 (slow), 0.5 (moderate), 1 (fast)`,

  hush: `hush() - Stop all sounds immediately
Use when things get too loud or to reset`,
};

export const getStrudelHelpTool: ToolHandler = async (args) => {
  const topic = (args.topic as string).toLowerCase().trim();

  // Direct match
  if (STRUDEL_DOCS[topic]) {
    return {
      id: "get_strudel_help",
      output: STRUDEL_DOCS[topic],
    };
  }

  // Fuzzy match
  const keys = Object.keys(STRUDEL_DOCS);
  const match = keys.find((k) => k.includes(topic) || topic.includes(k));
  if (match) {
    return {
      id: "get_strudel_help",
      output: STRUDEL_DOCS[match],
    };
  }

  // Not found - list available topics
  return {
    id: "get_strudel_help",
    output: `Topic "${topic}" not found. Available topics: ${keys.join(", ")}`,
  };
};

// =============================================================================
// list_samples - List available sample banks
// =============================================================================

export const listSamplesDefinition: ToolDefinition = {
  name: "list_samples",
  description: "List available sample banks or describe common samples",
  parameters: {
    type: "object",
    properties: {
      bank: {
        type: "string",
        description: "Sample bank name to get details about (optional)",
      },
    },
  },
};

// Common sample banks reference
const SAMPLE_BANKS: Record<string, string> = {
  default: "bd, sd, hh, oh, cp, rim, tom, perc, bass, lead - basic sounds",
  RolandTR909: "Classic TR-909 drum machine: bd, sd, hh, oh, cp, rim, tom",
  RolandTR808: "Classic TR-808 drum machine: bd, sd, hh, oh, cp, cb, ma, cl",
  casio: "Casio keyboard samples",
  jazz: "Jazz drum kit samples",
  gm: "General MIDI sounds (use with .n() for variants)",
  metal: "Metal/industrial percussion",
  house: "House music drum samples",
  techno: "Techno percussion",
};

export const listSamplesTool: ToolHandler = async (args) => {
  const bank = args.bank as string | undefined;

  if (bank) {
    const bankLower = bank.toLowerCase();
    const info = SAMPLE_BANKS[bankLower] || SAMPLE_BANKS[bank];
    if (info) {
      return {
        id: "list_samples",
        output: `Bank "${bank}": ${info}`,
      };
    }
    return {
      id: "list_samples",
      output: `Bank "${bank}" not in quick reference. Try using it anyway with .bank("${bank}")`,
    };
  }

  // List all banks
  const output = Object.entries(SAMPLE_BANKS)
    .map(([name, desc]) => `• ${name}: ${desc}`)
    .join("\n");

  return {
    id: "list_samples",
    output: `Available sample banks:\n${output}\n\nUse with: s("bd sd").bank("RolandTR909")`,
  };
};
