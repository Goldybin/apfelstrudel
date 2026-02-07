---
name: GitHub Actions CI patterns
description: CI patterns that call Make targets
---

# Skill: GitHub Actions CI patterns

## Goal
Keep CI simple and repo-driven: workflows should call Make targets.

## Conventions
- Always include `actions/checkout@v4`.
- Prefer a single `make check` step.
- Keep language/tool setup minimal unless required.
- For this project, set up Bun via `oven-sh/setup-bun@v2`.

## Files
- `.github/workflows/ci.yml`
