# Docker Compose Setup

This guide centralizes the docker-compose steps for local orchestration of the Botanical Audit Framework services.

## Prerequisites
- Docker Desktop or another compatible Docker runtime installed.
- Access to the environment variables described in `ENVIRONMENT_CONFIG.md`.

## Base Commands
Use the project-level compose file to stand up the stack:

```powershell
# Build images and launch services in the foreground
docker compose -f docker-compose.yml up --build

# Launch in the background once images are built
docker compose -f docker-compose.yml up -d

# View logs for all services
docker compose -f docker-compose.yml logs -f

# Tear down services and networks
docker compose -f docker-compose.yml down
```

## Additional Resources
- `docs/deployment/DOCKER_INSTALLATION_GUIDE.md` for installation steps.
- `docs/deployment/DEPLOYMENT_GUIDE_QUICK.md` for the compact runtime checklist.
