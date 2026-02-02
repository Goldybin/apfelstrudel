---
applyTo: "**/tools/**/*.ts,**/agent/**/*.ts"
---

# Agent Tools Instructions

## Tool Definition Pattern

Tools follow a consistent pattern based on steward-style architecture:

```typescript
import type { ToolDefinition, ToolResult } from "../shared/types.ts";
import type { ToolHandler, AppState } from "./shared.ts";

export const myToolDefinition: ToolDefinition = {
  name: "my_tool",
  description: "Clear description of what the tool does",
  parameters: {
    type: "object",
    properties: {
      param1: { type: "string", description: "..." },
      param2: { type: "number", description: "..." },
    },
    required: ["param1"],
  },
};

export const myToolHandler: ToolHandler = async (
  args: { param1: string; param2?: number },
  state: AppState
): Promise<ToolResult> => {
  // Implementation
  return { success: true, data: result };
};
```

## Tool Categories

### Pattern Tools (`pattern.ts`)
- `get_pattern` - Read current code
- `set_pattern` - Replace code entirely  
- `modify_pattern` - Insert before/after existing code

### Transport Tools (`transport.ts`)
- `play_music` - Start playback
- `stop_music` - Stop playback
- `strudel_evaluate` - Evaluate without changing editor

### Tempo Tools (`tempo.ts`)
- `set_tempo` - Adjust BPM (validates 20-300 range)

### Reference Tools (`reference.ts`)
- `get_strudel_help` - Query embedded documentation
- `list_samples` - List available sample banks

### Task Tools (`todo.ts`)
- `manage_todo` - Track tasks/ideas for user

## Guidelines

1. **Clear descriptions** - LLM reads these to decide when to use tools
2. **Validate inputs** - Return errors gracefully, don't throw
3. **Use AppState** - Access `getState()` and `broadcast()` for side effects
4. **Return structured data** - Always return `ToolResult` with success flag
5. **Document parameters** - Include descriptions in JSON schema

## Registration

All tools must be registered in `src/tools/index.ts`:

```typescript
export const toolHandlers: Record<string, ToolHandler> = {
  get_pattern: getPatternHandler,
  set_pattern: setPatternHandler,
  // ...
};

export const toolDefinitions: ToolDefinition[] = [
  getPatternDefinition,
  setPatternDefinition,
  // ...
];
```
