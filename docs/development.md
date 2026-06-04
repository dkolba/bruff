# Development

Available scripts:

```bash
pnpm start # Start the showcase game
pnpm run ok # Validate that all packages are passing quality checks
pnpm run format # Format code in all packages
pnpm run lint # Lint code in all packages
pnpm test # Run tests in all packages
pnpm run typecheck # Run typecheck in all packages
pnpm run build # Build showcase game
```

For more scripts see workspace packages.

## Development inside of local Docker container

This section guides you through setting up a local development environment using a simple Docker container. This allows you to run the application in a containerized sandbox environment (including Pi coding agent).

### Prerequisites

- **Docker**: Ensure you have Docker installed and running.
- **SSH Keys for Agent** (optional): Create an SSH key-pair for your coding agent

If you do not alrady have an existing ssh key-pair for your agent, generate a new pair in the "secrets/" folder of this project.

```bash
make ssh-keygen GIT_USER_NAME="asdf jklö"
```

If you have pre-existing keys, put them into the "secrets/" folder.

Upload the public key ("secrets/id_ed25519.pub") into your agent's GitHub account.

### 1. Build the Docker Image and run the Development Container

This command builds the development server Docker image and starts a detached Docker container, mounting the entire project as `/app` inside the container. It also maps port 5173 to localhost for the Vite development server.

```bash
make build run \
  REVISION=v1 \
  GIT_USER_NAME="Agent Name" \
  GIT_USER_EMAIL="agent@example.com"
```

### 2. Authenticate GitHub CLI inside the container

To use GitHub CLI within the running container, you have to go through the authentication step once (credential will be saved into a volume for further use).

```bash
make gh-login
```

You will be asked a series of questions, answer them as follows:

- Where do you use GitHub? -> GitHub.com
- What is your preferred protocol for Git operations on this host? -> SSH
- Generate a new SSH key to add to your GitHub account? (Y/n) -> n
- How would you like to authenticate GitHub CLI? -> Login with a web browser

### 3. Attach to the Container with Pi Agent CLI

To use the Pi coding agent on the CLI within the running container, execute the following command.

```bash
make pi
```

### 4. Open a Bash Shell in the Container

If you need a direct bash shell within the container for debugging or manual operations:

```bash
make shell
```

### 5. Stop and Remove the Docker Container

When you are finished, stop the running container. The `--rm` flag in the `docker run` command ensures the container is automatically removed upon stopping.

```bash
make stop
```

## Development in local Docker-Desktop Kubernetes │

This section guides you through setting up a local development environment using Docker Desktop's built-in Kubernetes cluster. This allows you to run the application in a containerized environment that mirrors a production setup.

### Prerequisites

- **Docker Desktop**: Ensure you have Docker Desktop installed and running.
- **Kubernetes**: Enable the Kubernetes cluster (kind not kubeadm) in Docker Desktop's settings. Go to `Settings > Kubernetes > Enable Kubernetes`. Make sure in Docker Desktop settings that you also use containered image store.

### 1. Build the Docker Image

First, build the Docker image for the development server. The `-t` flag tags the image for easy reference. The `pullPolicy: Never` in the Helm chart means Kubernetes will use this local image.

```bash
docker build \
	--build-arg GIT_USER_NAME="$(GIT_USER_NAME)" \
	--build-arg GIT_USER_EMAIL="$(GIT_USER_EMAIL)" \
	-t bruff-dev-server:$(REVISION) \
	-f Dockerfile.agent .
```

### 2. Deploy to Kubernetes with Helm

Next, use Helm to deploy the application to your local Kubernetes cluster. This command installs a new release named `brough-dev` using the chart located in the `./chart` directory.

```bash
helm upgrade --install bruff-dev-server ./helm/bruff --set image.tag=$(REVISION)
```

Once deployed, the service will need to be exposed via port-forwarding. You can access the running application at [http://localhost:5173](http://localhost:5173).

```bash
kubectl port-forward svc/bruff-dev-server 5173:5173
```

### 3. Undeploy from Kubernetes with Helm

To remove the application from your Kubernetes cluster, use the `helm uninstall` command. This will delete all resources associated with the `brough-dev` release.

```bash
helm uninstall bruff-dev-server
```
