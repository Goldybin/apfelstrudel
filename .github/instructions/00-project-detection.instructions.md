---
applyTo: "**/*"
---

# Project Detection Heuristics

When working on this codebase, detect the project type using these indicators:

## Bun/TypeScript Project

**Indicators:**
- `package.json` with `"type": "module"`
- `bun.lockb` lockfile
- TypeScript files (`.ts`, `.tsx`)
- `tsconfig.json` present
- `Makefile` present

## CRITICAL: Always Use Makefile

**NEVER invoke `bun` or `npm` directly.** All commands go through Make:

```bash
make install      # Install dependencies
make dev          # Development server
make build        # Production build
make check        # Lint + typecheck + test
make test         # Run tests
make clean        # Remove build artifacts
```

## This Project: Apfelstrudel

**Type:** Bun web application with embedded strudel.cc REPL and AI agent

**Frontend Stack:** Preact + HTM (vendored, no CDN)

**Key Backend Dependencies:**
- `@strudel/web` - Strudel live coding environment  
- `openai` - LLM client
- Bun built-in server and WebSocket

**Structure:**
```
src/
  server/     # Bun HTTP/WS server
  agent/      # LLM agent loop
  tools/      # Agent tools
  shared/     # Shared types
public/
  vendor/     # Vendored JS dependencies (Preact, HTM, Strudel)
  index.html
  app.js
  styles.css
```

## Dependency Policy

- **Backend:** Dependencies installed via `make install`
- **Frontend:** All JS deps MUST be vendored in `public/vendor/`
- **No CDN imports** — everything runs offline
- **Build output:** Bundled into `dist/` for releases
