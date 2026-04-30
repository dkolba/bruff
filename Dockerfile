# Use an official Node.js runtime
FROM node:24-slim

# Install global tools (if really needed)
RUN apt-get update && apt-get install -y curl vim && rm -rf /var/lib/apt/lists/*

# Setup pnpm + global bin dir
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@11.0.2 --activate

# Set working directory
WORKDIR /app

# Copy only dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/utils/package.json ./packages/utils/package.json
COPY packages/game/package.json ./packages/game/package.json
COPY packages/arcade/package.json ./packages/arcade/package.json
COPY packages/game-element/package.json ./packages/game-element/package.json

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --no-frozen-lockfile --force

# Install Playwright system dependencies and browsers
RUN pnpm dlx playwright install --with-deps

# Copy the rest of the app
COPY . .
RUN chown -R node:node /app
USER node

RUN curl -fsSL https://claude.ai/install.sh | bash

ENV PATH="/home/node/.local/bin:${PATH}"

# Expose port
EXPOSE 5173


# Use pnpm to start the app
CMD ["pnpm", "start", "--host", "0.0.0.0"]