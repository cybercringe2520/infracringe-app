.PHONY: help setup lint

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-10s %s\n", $$1, $$2}'

setup: ## Install Git hooks
	pre-commit install

lint: ## Run all checks on all files
	pre-commit run --all-files
