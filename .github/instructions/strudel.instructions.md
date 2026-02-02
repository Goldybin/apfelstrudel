---
applyTo: "**/public/**,**/*.html,**/*.css"
---

# Strudel Integration Instructions

## Overview

Strudel.cc is a live coding environment for music. The frontend integrates Strudel for pattern editing and audio playback.

## Vendored Dependencies

Strudel packages MUST be vendored in `public/vendor/strudel/`:

```
public/vendor/strudel/
  web.mjs         # @strudel/web
  mini.mjs        # @strudel/mini (mini-notation parser)
  core.mjs        # @strudel/core
  webaudio.mjs    # @strudel/webaudio
  draw.mjs        # @strudel/draw (optional visualization)
```

## Import Map Setup

In `public/index.html`, use an import map for vendored modules:

```html
<script type="importmap">
{
  "imports": {
    "@strudel/web": "/vendor/strudel/web.mjs",
    "@strudel/mini": "/vendor/strudel/mini.mjs",
    "preact": "/vendor/preact/preact.mjs",
    "preact/hooks": "/vendor/preact/hooks.mjs",
    "htm": "/vendor/htm/htm.mjs"
  }
}
</script>
```

## Mini-Notation Quick Reference

Patterns use Strudel's mini-notation:

```javascript
// Sounds
s("bd sd hh sd")           // Drum sounds
s("bd*4")                  // Repeat 4 times per cycle
s("bd sd").bank("RolandTR808")  // Specific sample bank

// Notes  
note("c3 e3 g3")           // Note names
note("0 4 7").scale("C:minor")  // Scale degrees

// Modifiers
.fast(2)                   // Double speed
.slow(2)                   // Half speed
.rev()                     // Reverse
.lpf(800)                  // Low-pass filter

// Structure
stack(p1, p2, p3)          // Layer patterns
cat(p1, p2)                // Sequence patterns
```

## WebSocket Messages

The agent controls Strudel via these message types:

```typescript
// Set pattern code
{ type: "set_pattern", code: "s('bd sd')" }

// Transport control
{ type: "transport_control", action: "play" | "stop" }

// Tempo change
{ type: "set_tempo", cps: 0.5 }  // 0.5 CPS = 60 BPM

// Evaluate without changing editor
{ type: "evaluate", code: "s('bd sd')" }
```

## Audio Context

Web Audio requires user gesture to start. The frontend should:
1. Show a "Click to enable audio" overlay on first load
2. Resume AudioContext on first user interaction
3. Then allow programmatic playback

## Error Handling

Strudel evaluation can fail. Always wrap in try/catch:

```javascript
try {
  await strudelRepl.evaluate(code);
} catch (err) {
  // Show error to user, don't crash
  console.error('[Strudel] Eval error:', err);
}
```
