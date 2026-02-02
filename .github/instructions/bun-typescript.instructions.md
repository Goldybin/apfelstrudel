---
applyTo: "**/*.ts,**/*.tsx,**/package.json,**/Makefile"
---

# Bun/TypeScript Instructions

## CRITICAL: Always Use Makefile

**NEVER invoke `bun` directly.** Always use `make <target>` for all operations:

```bash
make install      # Install dependencies
make dev          # Development server with hot reload
make build        # Production build
make check        # Lint + typecheck + test
make test         # Run tests
make lint         # Run biome linter
make format       # Format code
make clean        # Remove build artifacts
```

This ensures full reproducibility across environments.

## Vendored Dependencies

**All JavaScript dependencies MUST be vendored** — never pulled from CDNs or the internet at runtime.

- Backend deps: installed via `make install`, committed lockfile (`bun.lockb`)
- Frontend deps: vendored in `public/vendor/` directory
- No `<script src="https://...">` or CDN imports in HTML/JS
- Import maps should reference local vendored files only

### Vendoring Process

1. Download the dependency (minified ESM build)
2. Place in `public/vendor/<package>/`
3. Reference via import map pointing to local path

## Frontend Stack: TypeScript + Preact + HTM

The frontend is written in **TypeScript** (`src/client/app.ts`) and bundled to JavaScript via Bun:

```bash
make build-client      # Bundle minified for production
make build-client-dev  # Bundle with sourcemaps for debugging
```

Using **Preact** (lightweight React alternative) with **HTM** (tagged template literals instead of JSX):

```typescript
import { h, render } from '/vendor/preact/preact.mjs';
import { useState } from '/vendor/preact/hooks.mjs';
import htm from '/vendor/htm/htm.mjs';

const html = htm.bind(h);

function App(): h.JSX.Element {
  const [count, setCount] = useState(0);
  return html`<button onClick=${() => setCount(count + 1)}>${count}</button>`;
}
```

## Build Output

When cutting a release, all assets must be bundled into `dist/`:

```
dist/
  server.js       # Bundled backend (single file)
  public/         # Static frontend assets
    index.html
    app.js        # Bundled frontend
    vendor/       # Vendored dependencies
    styles.css
```

## Testing

- Test files: `*.test.ts` or `tests/*.ts`
- Run via `make test` (never `bun test` directly)
- Import from `bun:test`:

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
```

## Server Development

- Use Bun's built-in server: `Bun.serve()`
- WebSocket support is built-in
- Development: `make dev` (includes hot reload)

## TypeScript Configuration

- Enable strict mode
- Target ES2022+
- Use `"moduleResolution": "bundler"`

## Environment Variables

- Loaded from `.env` automatically
- Use `process.env.VAR_NAME` or `Bun.env.VAR_NAME`
