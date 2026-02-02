SHELL := /bin/sh

.DEFAULT_GOAL := help

# Apfelstrudel - Bun-based live coding music environment with AI agent
#
# IMPORTANT: Always use `make <target>` instead of invoking bun directly.
# This ensures reproducibility and consistent behavior across environments.
#
# See `make help` for available targets.

BUN ?= bun
PORT ?= 3000

.PHONY: help
help: ## Show targets
	@grep -E '^[a-zA-Z0-9_.-]+:.*?##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "%-18s %s\n", $$1, $$2}'

# =============================================================================
# Dependency install
# =============================================================================

.PHONY: install
install: ## Install project dependencies
	$(BUN) install

.PHONY: install-dev
install-dev: install ## Install dev dependencies (same as install for bun)

# =============================================================================
# Development
# =============================================================================

.PHONY: dev
dev: build-client ## Start development server with hot reload
	$(BUN) run dev

.PHONY: start
start: build-client ## Start production server
	$(BUN) run start

.PHONY: build
build: build-client ## Build for production
	$(BUN) run build

.PHONY: build-client
build-client: vendor ## Bundle frontend TypeScript to public/app.js
	$(BUN) build src/client/app.ts \
	  --outfile public/app.js \
	  --target browser \
	  --minify \
	  --external:@strudel/web \
	  --external:@strudel/mini \
	  --external:@strudel/webaudio \
	  --external:@strudel/core \
	  --external:preact \
	  --external:preact/hooks \
	  --external:htm

.PHONY: build-client-dev
build-client-dev: vendor ## Bundle frontend TypeScript (unminified, with sourcemaps)
	$(BUN) build src/client/app.ts \
	  --outfile public/app.js \
	  --target browser \
	  --sourcemap \
	  --external:@strudel/web \
	  --external:@strudel/mini \
	  --external:@strudel/webaudio \
	  --external:@strudel/core \
	  --external:preact \
	  --external:preact/hooks \
	  --external:htm

# =============================================================================
# Quality
# =============================================================================

.PHONY: lint
lint: ## Run linters (biome)
	$(BUN) run lint

.PHONY: format
format: ## Format code (biome)
	$(BUN) run format

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	$(BUN) run typecheck

.PHONY: test
test: ## Run tests
	$(BUN) test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	$(BUN) test --watch

.PHONY: coverage
coverage: ## Run tests with coverage
	$(BUN) test --coverage

.PHONY: check
check: lint typecheck test ## Run full validation pipeline

# =============================================================================
# Cleanup
# =============================================================================

.PHONY: clean
clean: ## Remove build artifacts and caches
	rm -rf dist/ .turbo/ node_modules/.cache/

.PHONY: clean-all
clean-all: clean ## Remove all generated files including node_modules
	rm -rf node_modules/ bun.lockb

# =============================================================================
# Vendor frontend dependencies
# =============================================================================

VENDOR_DIR := public/vendor

.PHONY: vendor
vendor: ## Download and vendor frontend dependencies
	@echo "Vendoring frontend dependencies..."
	@mkdir -p $(VENDOR_DIR)/preact $(VENDOR_DIR)/htm $(VENDOR_DIR)/strudel
	@echo "Downloading Preact..."
	@curl -sL "https://esm.sh/preact@10.24.3?bundle" -o $(VENDOR_DIR)/preact/preact.mjs
	@curl -sL "https://esm.sh/preact@10.24.3/hooks?bundle" -o $(VENDOR_DIR)/preact/hooks.mjs
	@echo "Downloading HTM..."
	@curl -sL "https://esm.sh/htm@3.1.1?bundle" -o $(VENDOR_DIR)/htm/htm.mjs
	@echo "Downloading Strudel..."
	@curl -sL "https://esm.sh/@strudel/web@1.3.0?bundle" -o $(VENDOR_DIR)/strudel/web.mjs
	@curl -sL "https://esm.sh/@strudel/mini@1.3.0?bundle" -o $(VENDOR_DIR)/strudel/mini.mjs
	@curl -sL "https://esm.sh/@strudel/webaudio@1.3.0?bundle" -o $(VENDOR_DIR)/strudel/webaudio.mjs
	@curl -sL "https://esm.sh/@strudel/core@1.3.0?bundle" -o $(VENDOR_DIR)/strudel/core.mjs
	@echo "✓ Vendored dependencies to $(VENDOR_DIR)/"

.PHONY: vendor-clean
vendor-clean: ## Remove vendored frontend dependencies
	rm -rf $(VENDOR_DIR)/preact $(VENDOR_DIR)/htm $(VENDOR_DIR)/strudel

# =============================================================================
# Docker (optional)
# =============================================================================

IMAGE_NAME ?= apfelstrudel
IMAGE_TAG ?= latest

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

.PHONY: docker-run
docker-run: ## Run Docker container
	docker run -it --rm -p $(PORT):$(PORT) \
		-e OPENAI_API_KEY \
		-e AZURE_OPENAI_ENDPOINT \
		-e AZURE_OPENAI_KEY \
		-e AZURE_OPENAI_DEPLOYMENT \
		$(IMAGE_NAME):$(IMAGE_TAG)

# =============================================================================
# Utilities
# =============================================================================

.PHONY: outdated
outdated: ## Check for outdated dependencies
	$(BUN) outdated

.PHONY: update
update: ## Update dependencies
	$(BUN) update

.PHONY: env-check
env-check: ## Verify required environment variables
	@echo "Checking environment variables..."
	@if [ -z "$$OPENAI_API_KEY" ] && [ -z "$$AZURE_OPENAI_KEY" ]; then \
		echo "⚠️  Warning: Neither OPENAI_API_KEY nor AZURE_OPENAI_KEY is set"; \
		echo "   Set one of these for the agent to work"; \
	else \
		echo "✓ LLM API key configured"; \
	fi
