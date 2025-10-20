# GACP Platform - Docker Setup Guide

## Option 1: Docker Installation & Node.js Container Setup

### Step 1: Install Docker Desktop

1. Download Docker Desktop from: https://docker.com/get-started/
2. Choose "Docker Desktop for Windows"
3. Run the installer and follow the setup wizard
4. Restart your computer when prompted
5. Start Docker Desktop from the Start menu

### Step 2: Verify Docker Installation

```powershell
docker --version
docker run hello-world
```

### Step 3: Pull Node.js Image and Run Container

```powershell
# Pull the Node.js Docker image:
docker pull node:22-alpine

# Create a Node.js container and start a Shell session:
docker run -it --rm --entrypoint sh node:22-alpine

# Inside the container, verify versions:
node -v  # Should print "v22.20.0"
npm -v   # Should print "10.9.3"
```

### Step 4: Run GACP Platform in Docker Container

```powershell
# Navigate to your project directory
cd C:\Users\usEr\Documents\GitHub\gacp-certify-flow-main

# Run Node.js container with volume mount to access your project files
docker run -it --rm -p 3004:3004 -v ${PWD}:/workspace -w /workspace node:22-alpine sh

# Inside the container, navigate to backend and install dependencies
cd apps/backend
npm install

# Start the GACP Platform server
node atlas-server.js
```

## Option 2: Direct Node.js Installation (Alternative)

### Step 1: Install Node.js Directly

1. Go to https://nodejs.org
2. Download "LTS" version (recommended)
3. Run the installer
4. Restart PowerShell/VS Code
5. Verify installation:

```powershell
node -v
npm -v
```

### Step 2: Run GACP Platform

```powershell
cd C:\Users\usEr\Documents\GitHub\gacp-certify-flow-main\apps\backend
npm install
node atlas-server.js
```

## Quick Docker Command for GACP Platform

Once Docker is installed, use this single command to run the GACP Platform:

```powershell
docker run -it --rm -p 3004:3004 -v ${PWD}:/workspace -w /workspace/apps/backend node:22-alpine sh -c "npm install && node atlas-server.js"
```

Then open: http://localhost:3004/demo.html

## Docker Compose Option (Recommended for Development)

Create a docker-compose.yml file for easier management:

```yaml
version: '3.8'
services:
  gacp-backend:
    image: node:22-alpine
    ports:
      - '3004:3004'
    volumes:
      - .:/workspace
    working_dir: /workspace/apps/backend
    command: sh -c "npm install && node atlas-server.js"
    environment:
      - NODE_ENV=development
```

Then run:

```powershell
docker-compose up
```

## Troubleshooting

### Common Issues:

1. **Docker not starting**: Ensure virtualization is enabled in BIOS
2. **Port already in use**: Use different port: `-p 3005:3004`
3. **Permission issues**: Run PowerShell as Administrator
4. **Volume mount issues**: Use full path instead of ${PWD}

### WSL2 Requirements (Windows):

- Docker Desktop requires WSL2 on Windows
- Follow the installation prompts to install WSL2 if needed

## Next Steps After Installation

1. ✅ Install Docker Desktop or Node.js directly
2. ✅ Run the GACP Platform server
3. ✅ Open http://localhost:3004/demo.html
4. ✅ Test all API endpoints
5. ✅ View monitoring dashboard at http://localhost:3004/monitoring-dashboard.html

Choose the option that works best for your environment!
