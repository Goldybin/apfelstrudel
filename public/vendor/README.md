# Vendored JavaScript Dependencies

This directory contains vendored JavaScript dependencies for the frontend.

**DO NOT import from CDNs** — all frontend dependencies must be vendored here.

## Structure

```
vendor/
  preact/
    preact.mjs          # Preact core
    hooks.mjs           # Preact hooks
  htm/
    htm.mjs             # HTM tagged templates
  strudel/
    web.mjs             # @strudel/web
    mini.mjs            # @strudel/mini
    webaudio.mjs        # @strudel/webaudio
    core.mjs            # @strudel/core
```

## Vendoring New Dependencies

1. Download the ESM build:
   ```bash
   curl -o public/vendor/package/module.mjs "https://esm.sh/package@version?bundle"
   ```

2. Add to import map in `public/index.html`

3. Import in JavaScript:
   ```javascript
   import { something } from 'package';
   ```

## Why Vendor?

- **Offline support** — works without internet
- **Reproducibility** — exact versions committed
- **Security** — no runtime dependency on CDNs
- **Performance** — served from same origin
