# Apfelstrudel - AI-Powered Live Coding Music Environment

> A bun-based web application combining strudel.cc live coding with an AI agent chat sidebar that can edit and execute music patterns in real time.

## Overview

Apfelstrudel (German for "apple strudel" 🥧) merges the creative power of [strudel.cc](https://strudel.cc/) algorithmic music patterns with an AI agent capable of understanding, generating, and manipulating live code. The agent uses an agentic loop architecture inspired by [bun-steward](https://github.com/rcarmo/bun-steward) to provide intelligent assistance with music composition.

## Goals

1. **Embeddable REPL**: Host a strudel.cc REPL using `@strudel/web` or `@strudel/repl` packages
2. **Agent Chat Sidebar**: Provide a conversational interface for the AI to assist with music creation
3. **Real-time Code Manipulation**: Allow the agent to read, modify, and execute strudel patterns
4. **Tool-based Architecture**: Implement steward-style tools for the agent to interact with the environment
5. **Low Latency**: Minimize delays between user requests and music changes

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Frontend)                        │
├────────────────────────────┬────────────────────────────────────┤
│     Strudel REPL Panel     │         Agent Chat Sidebar         │
│  ┌──────────────────────┐  │  ┌────────────────────────────────┐│
│  │   CodeMirror Editor  │  │  │      Message History           ││
│  │                      │  │  │  ┌──────────────────────────┐  ││
│  │   pattern code...    │  │  │  │ User: make it jazzy     │  ││
│  │                      │  │  │  │ Agent: Adding swing...  │  ││
│  └──────────────────────┘  │  │  └──────────────────────────┘  ││
│  ┌──────────────────────┐  │  │                                ││
│  │   Visualizer/Scope   │  │  │  ┌────────────────────────────┐││
│  └──────────────────────┘  │  │  │     Input + Send Button    │││
│  [▶ Play] [⏹ Stop] [Share]  │  │  └────────────────────────────┘││
└────────────────────────────┴────────────────────────────────────┘
                                    │
                                    │ WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Bun Server (Backend)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   HTTP Server   │  │ WebSocket Hub   │  │  Static Files   │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘  │
│           │                    │                                 │
│           ▼                    ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     Agent Runner                             ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ││
│  │  │ LLM Client  │  │ Tool Defs   │  │ Message/State Mgmt  │  ││
│  │  │ (OpenAI/    │  │             │  │                     │  ││
│  │  │  Azure)     │  │             │  │                     │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                        Tools                                 ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ ││
│  │  │ get_pattern  │ │ set_pattern  │ │ strudel_evaluate     │ ││
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘ ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ ││
│  │  │ play_music   │ │ stop_music   │ │ get_strudel_help     │ ││
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘ ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ ││
│  │  │ list_samples │ │ set_tempo    │ │ manage_todo          │ ││
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Strudel Packages**: `@strudel/web` for easy setup, or `@strudel/repl` for full REPL
- **UI Framework**: Vanilla TypeScript + HTML/CSS (minimal dependencies)
- **Editor**: CodeMirror (bundled with strudel) or custom textarea
- **Communication**: WebSocket for real-time agent interaction

### Backend
- **Runtime**: [Bun](https://bun.sh/) - fast JavaScript/TypeScript runtime
- **HTTP/WS**: Bun's built-in server APIs
- **Agent Loop**: Adapted from bun-steward's runner architecture
- **LLM Providers**: OpenAI, Azure OpenAI (via OpenAI SDK)

### Key Dependencies
```json
{
  "@strudel/web": "^1.3.0",
  "@strudel/codemirror": "^1.3.0",
  "@strudel/mini": "^1.2.6",
  "@strudel/tonal": "^1.2.6",
  "@strudel/webaudio": "^1.3.0",
  "@strudel/draw": "^1.2.6",
  "openai": "^4.x"
}
```

## Agent Tools

The agent has access to specialized tools for music manipulation. Each tool follows the steward pattern with a definition and handler.

### Core Music Tools

#### `get_pattern`
Read the current pattern code from the REPL.
```typescript
{
  name: "get_pattern",
  description: "Get the current strudel pattern code from the editor",
  parameters: { type: "object", properties: {} }
}
```

#### `set_pattern`
Replace the entire pattern with new code.
```typescript
{
  name: "set_pattern",
  description: "Set a new strudel pattern in the editor",
  parameters: {
    type: "object",
    properties: {
      code: { type: "string", description: "The strudel pattern code" },
      autoplay: { type: "boolean", description: "Start playing immediately" }
    },
    required: ["code"]
  }
}
```

#### `modify_pattern`
Apply targeted modifications to the current pattern.
```typescript
{
  name: "modify_pattern",
  description: "Modify the current pattern by applying transformations",
  parameters: {
    type: "object",
    properties: {
      transformation: { 
        type: "string", 
        enum: ["add_effect", "change_sound", "adjust_rhythm", "add_layer", "remove_layer"],
        description: "Type of modification"
      },
      details: { type: "string", description: "Specific modification instructions" }
    },
    required: ["transformation", "details"]
  }
}
```

#### `strudel_evaluate`
Evaluate/execute the current pattern (trigger play).
```typescript
{
  name: "strudel_evaluate",
  description: "Evaluate and start playing the current pattern",
  parameters: { type: "object", properties: {} }
}
```

#### `play_music` / `stop_music`
Transport controls.
```typescript
{
  name: "play_music",
  description: "Start playback of the current pattern",
  parameters: { type: "object", properties: {} }
}

{
  name: "stop_music",
  description: "Stop playback (hush)",
  parameters: { type: "object", properties: {} }
}
```

#### `set_tempo`
Adjust the cycles per second (tempo).
```typescript
{
  name: "set_tempo",
  description: "Set the tempo in cycles per second",
  parameters: {
    type: "object",
    properties: {
      cps: { type: "number", description: "Cycles per second (0.1-4)" }
    },
    required: ["cps"]
  }
}
```

### Reference Tools

#### `get_strudel_help`
Retrieve documentation for strudel functions.
```typescript
{
  name: "get_strudel_help",
  description: "Get documentation for a strudel function or concept",
  parameters: {
    type: "object",
    properties: {
      topic: { type: "string", description: "Function name or concept (e.g., 'note', 's', 'jux', 'mini-notation')" }
    },
    required: ["topic"]
  }
}
```

#### `list_samples`
List available sample banks and sounds.
```typescript
{
  name: "list_samples",
  description: "List available sample banks or sounds within a bank",
  parameters: {
    type: "object",
    properties: {
      bank: { type: "string", description: "Sample bank name (optional, lists all banks if omitted)" }
    }
  }
}
```

### Utility Tools (from steward)

#### `manage_todo`
Track multi-step composition tasks.
```typescript
{
  name: "manage_todo",
  description: "Manage a todo list for tracking composition steps",
  parameters: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["list", "add", "done", "set_status"] },
      title: { type: "string" },
      id: { type: "number" },
      status: { type: "string", enum: ["not-started", "in-progress", "done"] }
    },
    required: ["action"]
  }
}
```

## Communication Protocol

### WebSocket Messages

#### Client → Server

```typescript
// User sends a chat message
{ type: "chat", message: string }

// Pattern changed in editor
{ type: "pattern_update", code: string }

// Transport state changed
{ type: "transport", action: "play" | "stop" }

// Request current state
{ type: "sync_request" }
```

#### Server → Client

```typescript
// Agent thinking/streaming response
{ type: "agent_thinking", content: string }

// Agent finished response
{ type: "agent_response", content: string, toolCalls?: ToolCall[] }

// Tool is being executed
{ type: "tool_start", name: string, args: object }

// Tool completed
{ type: "tool_result", name: string, output: string, error?: boolean }

// Pattern should be updated in editor
{ type: "set_pattern", code: string, autoplay?: boolean }

// Transport control
{ type: "transport_control", action: "play" | "stop" }

// Tempo change
{ type: "set_cps", cps: number }

// State sync response
{ type: "sync_state", pattern: string, playing: boolean, cps: number }

// Error
{ type: "error", message: string }
```

## Agent System Prompt

```
You are a creative music assistant helping users compose algorithmic music patterns using Strudel, a JavaScript port of TidalCycles.

You have access to tools for reading, writing, and executing Strudel patterns in real time. The user can hear changes immediately.

Key guidelines:
1. Always read the current pattern with get_pattern before making changes
2. Make incremental changes - don't rewrite entire patterns unless asked
3. Explain what you're doing before and after making changes
4. Use musical terminology but keep explanations accessible
5. Suggest creative variations and teach concepts when relevant
6. If something sounds wrong, help debug by checking the pattern syntax

Strudel mini-notation basics:
- Patterns are sequences: "bd sd" plays kick then snare
- Square brackets group: "[bd sd] hh" plays kick+snare together, then hi-hat
- Asterisk repeats: "hh*4" plays hi-hat 4 times per cycle
- Angle brackets alternate: "<bd sd>" alternates each cycle
- Comma stacks: "bd, hh*4" layers kick and hi-hats

Common functions:
- s("sound") - sample playback
- note("pattern") - melodic notes
- n("pattern") - select sample variant
- .bank("name") - select sample bank
- .gain(value) - volume
- .speed(value) - playback speed
- .pan(value) - stereo position
- .lpf(freq) - low-pass filter
- .delay(amount) - echo effect
- .room(size) - reverb
- .jux(fn) - juxtapose left/right
- .rev() - reverse pattern
- .fast(n) / .slow(n) - speed up/slow down

When the user asks for changes, use tools to:
1. Get current pattern
2. Modify appropriately
3. Set new pattern (with autoplay=true for immediate feedback)

Keep responses concise and musical!
```

## File Structure

```
apfelstrudel/
├── .github/
│   ├── copilot-instructions.md
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── release.yml
│   ├── instructions/
│   │   └── bun.instructions.md
│   └── skills/
│       └── SKILL-makefile.md
├── src/
│   ├── server/
│   │   ├── index.ts          # Main server entry point
│   │   ├── websocket.ts      # WebSocket handler
│   │   └── routes.ts         # HTTP routes
│   ├── agent/
│   │   ├── runner.ts         # Agentic loop (from steward)
│   │   ├── llm.ts            # LLM client abstraction
│   │   ├── types.ts          # Message/Tool types
│   │   └── system-prompt.ts  # Agent system prompt
│   ├── tools/
│   │   ├── index.ts          # Tool registry
│   │   ├── pattern.ts        # get_pattern, set_pattern, modify_pattern
│   │   ├── transport.ts      # play_music, stop_music, strudel_evaluate
│   │   ├── tempo.ts          # set_tempo
│   │   ├── reference.ts      # get_strudel_help, list_samples
│   │   ├── todo.ts           # manage_todo (from steward)
│   │   └── shared.ts         # Common utilities
│   └── shared/
│       └── protocol.ts       # Shared message types
├── public/
│   ├── index.html            # Main HTML page
│   ├── styles.css            # Application styles
│   └── app.ts                # Frontend TypeScript
├── Makefile
├── package.json
├── tsconfig.json
├── bunfig.toml
├── SPEC.md
├── README.md
└── LICENSE
```

## Configuration

### Environment Variables

```bash
# LLM Provider (required)
APFELSTRUDEL_PROVIDER=openai|azure      # Default: openai
APFELSTRUDEL_MODEL=gpt-4o-mini          # Default: gpt-4o-mini

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=                         # Optional, for compatible APIs

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_KEY=...
AZURE_OPENAI_DEPLOYMENT=...
AZURE_OPENAI_API_VERSION=2024-10-01-preview

# Server
APFELSTRUDEL_PORT=3000                   # Default: 3000
APFELSTRUDEL_HOST=0.0.0.0                # Default: 0.0.0.0

# Agent
APFELSTRUDEL_MAX_STEPS=16                # Max tool calls per request
APFELSTRUDEL_TIMEOUT_MS=30000            # LLM request timeout
```

## UI Design

### Layout
- **Split pane**: Strudel REPL (left/top) + Chat sidebar (right/bottom)
- **Responsive**: Stacks vertically on narrow screens
- **Dark theme**: Match strudel.cc aesthetic

### Chat Sidebar Features
- Message history with user/agent distinction
- Tool call visualization (collapsible)
- Typing indicator while agent thinks
- Code blocks with syntax highlighting
- Copy button for pattern snippets

### REPL Panel Features
- CodeMirror editor with strudel syntax highlighting
- Play/Stop/Evaluate buttons
- Visual feedback (pianoroll, scope, or similar)
- Error display for invalid patterns
- Tempo control slider

## Development Phases

### Phase 1: Foundation
- [x] Project scaffolding (from agentbox/skel)
- [ ] Basic bun server with static file serving
- [ ] Strudel REPL integration (using @strudel/web)
- [ ] WebSocket infrastructure

### Phase 2: Agent Core
- [ ] Port steward runner/llm to project
- [ ] Implement basic tools (get_pattern, set_pattern, play, stop)
- [ ] WebSocket message protocol
- [ ] Basic chat UI

### Phase 3: Music Tools
- [ ] Full tool set implementation
- [ ] Strudel documentation integration
- [ ] Sample bank listing
- [ ] Pattern modification helpers

### Phase 4: Polish
- [ ] Improved UI/UX
- [ ] Error handling and recovery
- [ ] Streaming responses
- [ ] Session persistence
- [ ] Mobile responsiveness

### Phase 5: Advanced Features
- [ ] Pattern history/undo
- [ ] Preset patterns library
- [ ] Multi-user jam sessions
- [ ] MIDI/OSC integration
- [ ] Recording/export

## License

This project is licensed under **AGPL-3.0** to comply with strudel.cc's license requirements. Any distribution or modification must maintain the same license and provide source code access.

## References

- [strudel.cc](https://strudel.cc/) - Web-based live coding music environment
- [strudel documentation](https://strudel.cc/learn/) - Learning resources
- [@strudel packages](https://www.npmjs.com/search?q=%40strudel) - NPM packages
- [bun-steward](https://github.com/rcarmo/bun-steward) - Agentic loop inspiration
- [agentbox](https://github.com/rcarmo/agentbox) - Project scaffolding source
- [TidalCycles](https://tidalcycles.org/) - Original Haskell live coding language
