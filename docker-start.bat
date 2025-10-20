@echo off
echo.
echo ========================================
echo   GACP Platform - Docker Quick Start
echo ========================================
echo.

echo Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo.
    echo Please install Docker Desktop from: https://docker.com/get-started/
    echo Then restart this script.
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is available!
echo.

echo Choose your option:
echo.
echo 1. Quick Start - Run GACP Platform with Docker
echo 2. Simple Server - Run basic Node.js server (port 3000)
echo 3. Enhanced Simple Server - Run GACP Simple Server (port 3000)
echo 4. Pull Node.js image and start interactive shell
echo 5. Use Docker Compose (recommended)
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto quickstart
if "%choice%"=="2" goto simpleserver
if "%choice%"=="3" goto gacpsimple
if "%choice%"=="4" goto interactive
if "%choice%"=="5" goto compose
if "%choice%"=="6" goto exit
goto invalid

:quickstart
echo.
echo 🚀 Starting GACP Platform with Docker...
echo.
docker run -it --rm -p 3004:3004 -v "%cd%":/workspace -w /workspace/apps/backend node:22-alpine sh -c "npm install && node atlas-server.js"
goto end

:simpleserver
echo.
echo 🚀 Starting simple Node.js server on port 3000...
echo.
docker run -it --rm -p 3000:3000 -v "%cd%":/workspace -w /workspace node:22-alpine node server.mjs
goto end

:gacpsimple
echo.
echo 🌿 Starting GACP Simple Server on port 3000...
echo.
docker run -it --rm -p 3000:3000 -v "%cd%":/workspace -w /workspace node:22-alpine node gacp-simple-server.mjs
goto end

:interactive
echo.
echo 🔧 Starting interactive Node.js shell...
echo.
echo Commands to run inside the container:
echo   cd /workspace/apps/backend
echo   npm install
echo   node atlas-server.js
echo.
docker pull node:22-alpine
docker run -it --rm -p 3004:3004 -v "%cd%":/workspace -w /workspace node:22-alpine sh
goto end

:compose
echo.
echo 🐳 Using Docker Compose...
echo.
if not exist "docker-compose.gacp.yml" (
    echo ❌ docker-compose.gacp.yml not found
    goto end
)
docker-compose -f docker-compose.gacp.yml up
goto end

:invalid
echo Invalid choice. Please select 1-6.
pause
goto end

:exit
echo Goodbye!
goto end

:end
echo.
echo 📋 Once running, access the demo at:
echo    http://localhost:3004/demo.html
echo.
echo 📊 View monitoring dashboard at:
echo    http://localhost:3004/monitoring-dashboard.html
echo.
pause