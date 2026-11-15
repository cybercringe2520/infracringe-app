.PHONY: help setup lint up down logs ps test reset-db

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-10s %s\n", $$1, $$2}'

setup: ## Install Git hooks
	pre-commit install

lint: ## Run all checks on all files
	pre-commit run --all-files

up: ## Build and start the whole stack on http://localhost:8080
	docker compose up -d --build
	@echo "infracringe is running on http://localhost:8080"

down: ## Stop the stack (database data is kept)
	docker compose down

logs: ## Follow the logs of all services
	docker compose logs -f

ps: ## Show the status of each service
	docker compose ps -a

test: ## Run Go tests and the web lint and build
	cd api && go vet ./... && go test ./...
	cd web && npm run lint && npm run build

reset-db: ## Stop the stack and DELETE the local database
	docker compose down -v
