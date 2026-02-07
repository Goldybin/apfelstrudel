---
applyTo: "**/*"
---

# Project Detection Heuristics

When working on this codebase, detect the project type using these indicators:

- If `package.json` exists (or Bun is referenced) → apply `bun-typescript.instructions.md` and `frontend-bun.instructions.md`.
- If `Dockerfile` exists and CI is publishing images → apply `docker-image.instructions.md`.
- If `src/tools/` or `src/agent/` exists → apply `agent-tools.instructions.md`.
- If `public/vendor/strudel/` exists → apply `strudel.instructions.md`.

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

**Frontend Stack:** CodeMirror + Strudel (vendored, no CDN)

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
  vendor/     # Vendored JS dependencies (Strudel, CodeMirror, Preact, HTM)
  index.html
  app.js
  styles.css
```

## Dependency Policy

- **Backend:** Dependencies installed via `make install`
- **Frontend:** All JS deps MUST be vendored in `public/vendor/`
- **No CDN imports** — everything runs offline
- **Build output:** Bundled into `dist/` for releases
