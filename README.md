# bruff

A modern JavaScript/TypeScript roguelike game collection with focus on functional programming patterns and type safety.

## About Roguelikes

Roguelike games are a genre of role-playing games characterized by procedurally generated levels, turn-based gameplay, and permanent death mechanics. They traditionally feature ASCII or tile-based graphics and emphasize strategic decision-making.

## Project Structure

This monorepo contains the following packages:

- `@bruff/eslint-config`: Shared ESLint configuration enforcing consistent code style and best practices
- `@bruff/game`: Core game and roguelike mechanics implementation
- `@bruff/utils`: Functional programming utilities and helper functions used across packages

## Development

```bash
pnpm start # Start the showcase game
pnpm run ok # Validate that all packages are passing quality checks
pnpm run format # Format code in all packages
pnpm run lint # Lint code in all packages
pnpm test # Run tests in all packages
pnpm run typecheck # Run typecheck in all packages
pnpm run build # Build showcase game
```

## Development inside of local Docker container

This section guides you through setting up a local development environment using a simple Docker container. This allows you to run the application in a containerized sandbox environment.

### Prerequisites

- **Docker**: Ensure you have Docker installed and running.

### 1. Build the Docker Image

First, build the Docker image for the development server. The `-t` flag tags the image for easy reference.

```bash
docker build -t bruff-dev-server:latest -f Dockerfile .
```

### 2. Run the Docker Container

This command starts a detached Docker container, mounting your current working directory as `/app` inside the container. It also maps port 5173 for the Vite development server.

```bash
docker run -dit --rm -v "$(pwd)":/app -v /app/node_modules -p 5173:5173 --name bruff-dev-server bruff-dev-server:latest sh -c "pnpm install --frozen-lockfile --force && pnpm run start --host 0.0.0.0"
```

### 3. Attach to the Container with Agent CLI

To use an coding CLI Agent within the running container, execute the following command. Replace `$API_KEY` with your actual API key.

```bash
docker exec -it -e TERM=xterm-256color -e API_KEY="$API_KEY" bruff-dev-server <agent-cli>
```

### 4. Open a Bash Shell in the Container

If you need a direct bash shell within the container for debugging or manual operations:

```bash
docker exec -it bruff-dev-server /bin/bash
```

### 5. Stop and Remove the Docker Container

When you are finished, stop the running container. The `--rm` flag in the `docker run` command ensures the container is automatically removed upon stopping.

```bash
docker stop bruff-dev-server
```

## Development in local Docker-Desktop Kubernetes │

This section guides you through setting up a local development environment using Docker Desktop's built-in Kubernetes cluster. This allows you to run the application in a containerized environment that mirrors a production setup.

### Prerequisites

- **Docker Desktop**: Ensure you have Docker Desktop installed and running.
- **Kubernetes**: Enable the Kubernetes cluster (kind not kubeadm) in Docker Desktop's settings. Go to `Settings > Kubernetes > Enable Kubernetes`. Make sure in Docker Desktop settings that you also use containered image store.

### 1. Build the Docker Image

First, build the Docker image for the development server. The `-t` flag tags the image for easy reference. The `pullPolicy: Never` in the Helm chart means Kubernetes will use this local image.

```bash
docker build -t brough-dev-server:<revision> -f Dockerfile .
```

### 2. Deploy to Kubernetes with Helm

Next, use Helm to deploy the application to your local Kubernetes cluster. This command installs a new release named `brough-dev` using the chart located in the `./chart` directory.

```bash
helm upgrade --install bruff-dev-server ./helm/bruff --set image.tag=<revision>
```

Once deployed, the service will need to be exposed via port-forwarding. You can access the running application at [http://localhost:5173](http://localhost:5173).

```bash
kubectl port-forward svc/bruff-dev-server 5173:5173
```

### 3. Undeploy from Kubernetes with Helm

To remove the application from your Kubernetes cluster, use the `helm uninstall` command. This will delete all resources associated with the `brough-dev` release.

```bash
helm uninstall brhelm uninstall bruff-dev-serveruff-dev-server
```
