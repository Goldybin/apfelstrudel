# SKILL: Agent Tools Development

## Description

This project implements an AI agent with tools for manipulating strudel.cc music patterns. Tools follow the steward pattern.

## Tool Structure

Each tool has two parts:

### 1. Definition (JSON Schema)

```typescript
export const myToolDefinition: ToolDefinition = {
  name: "tool_name",
  description: "Clear description for the LLM",
  parameters: {
    type: "object",
    properties: {
      param: { type: "string", description: "Param description" }
    },
    required: ["param"]
  }
};
```

### 2. Handler (Implementation)

```typescript
export const myTool: ToolHandler = async (args) => {
  const param = args.param as string;
  // Implementation...
  return { id: "tool_name", output: "Result" };
};
```

## Adding a New Tool

1. Create file in `src/tools/my_tool.ts`
2. Export definition and handler
3. Register in `src/tools/index.ts`

```typescript
// In index.ts
import { myToolDefinition, myTool } from "./my_tool.ts";

export const toolHandlers = {
  // ...existing
  my_tool: myTool,
};

export const toolDefinitions = [
  // ...existing
  myToolDefinition,
];
```

## Testing Tools

```typescript
import { describe, it, expect } from "bun:test";
import { toolHandlers } from "../src/tools/index.ts";

describe("my_tool", () => {
  it("should work", async () => {
    const result = await toolHandlers.my_tool({ param: "test" });
    expect(result.error).toBeUndefined();
  });
});
```

## Error Handling

Return errors gracefully:

```typescript
return { 
  id: "tool_name", 
  output: `Error: ${message}`, 
  error: true 
};
```
