# Use an official Node.js runtime
FROM node:24-slim

# Setup pnpm + global bin dir
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy only dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Install global tools (if really needed)
RUN apt-get update && apt-get install -y curl vim && rm -rf /var/lib/apt/lists/*

USER node

RUN curl -fsSL https://claude.ai/install.sh | bash

# Copy the rest of the app
COPY . .

USER root

# Install Playwright system dependencies and browsers
RUN pnpm dlx playwright install --with-deps

USER node

ENV PATH="/home/node/.local/bin:${PATH}"

# Expose port
EXPOSE 5173

# Use pnpm to start the app
CMD ["pnpm", "start", "--host", "0.0.0.0"]