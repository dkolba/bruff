REVISION ?= latest
GIT_USER_NAME ?= Your Name
GIT_USER_EMAIL ?= your@name.com

.PHONY: help build run stop shell pi gh-login

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

ssh-keygen: ## Generate new SSH key-pair
	ssh-keygen -t ed25519 -f secrets/id_ed25519 -C "$(GIT_USER_NAME)"

build: ## Build Docker image
	docker build \
		--build-arg GIT_USER_NAME="$(GIT_USER_NAME)" \
		--build-arg GIT_USER_EMAIL="$(GIT_USER_EMAIL)" \
		-t bruff-dev-server:$(REVISION) \
		-f Dockerfile.agent .

run: ## Start development container
	docker run \
		-dit \
		--rm \
		-v "$$(pwd)":/app \
		-v bruff-node_modules:/app/node_modules \
		-v bruff-gh-config:/home/node/.config \
		-v bruff-pi-config:/home/node/.pi \
		-v "$$(pwd)/secrets:/home/node/.ssh:ro" \
		--tmpfs /app/secrets \
		-p 5173:5173 \
		--name bruff-dev-server \
		bruff-dev-server:$(REVISION) \
		sh -c "pnpm ci && pnpm run start --host 0.0.0.0"

gh-login: ## Authenticate GitHub CLI inside container
	docker exec -it \
		-e TERM=xterm-256color \
		bruff-dev-server \
		gh auth login

pi: ## Run pi inside container
	docker exec -it \
		-e TERM=xterm-256color \
		bruff-dev-server \
		pi

shell: ## Open bash shell inside container
	docker exec -it \
		-e TERM=xterm-256color \
		bruff-dev-server \
		bash

stop: ## Stop development container
	docker stop bruff-dev-server