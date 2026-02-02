# SKILL: Makefile-First Workflow

## Description

This project uses a Makefile as the primary interface for all development operations. Always prefer `make <target>` over direct tool commands.

## Available Targets

```bash
make help        # Show all available targets
make install     # Install dependencies
make dev         # Start development server
make build       # Build for production
make check       # Run lint + typecheck + test
make test        # Run tests only
make lint        # Run linter
make format      # Format code
make clean       # Remove build artifacts
```

## When to Use

- **Installing**: `make install` instead of `bun install`
- **Running dev**: `make dev` instead of `bun run dev`
- **Running tests**: `make test` instead of `bun test`
- **Full validation**: `make check` for the complete pipeline

## Benefits

1. Consistent interface across projects
2. Encapsulates tool-specific commands
3. Easy to extend with project-specific targets
4. Self-documenting via `make help`

## Adding New Targets

Add to `Makefile`:

```makefile
.PHONY: my-target
my-target: ## Description of target
	command to run
```

The `##` comment enables auto-documentation in `make help`.
