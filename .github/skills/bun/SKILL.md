# SKILL: Bun Development

## Description

This project uses Bun as the JavaScript/TypeScript runtime, package manager, bundler, and test runner.

## Key Commands

```bash
# Package management
bun install              # Install deps from package.json
bun add <pkg>            # Add dependency
bun add -d <pkg>         # Add dev dependency
bun remove <pkg>         # Remove dependency
bun update               # Update dependencies

# Running code
bun run <script>         # Run package.json script
bun <file.ts>            # Run TypeScript directly
bun --watch <file.ts>    # Run with auto-reload

# Testing
bun test                 # Run tests
bun test --watch         # Watch mode
bun test --coverage      # With coverage

# Building
bun build ./src/index.ts --outdir=./dist
```

## Server Pattern

```typescript
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello!");
  },
  websocket: {
    open(ws) { /* ... */ },
    message(ws, message) { /* ... */ },
    close(ws) { /* ... */ },
  },
});
```

## Testing Pattern

```typescript
import { describe, it, expect } from "bun:test";

describe("feature", () => {
  it("should work", () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Environment Variables

Bun auto-loads `.env` files. Access via:
- `process.env.VAR_NAME`
- `Bun.env.VAR_NAME`
