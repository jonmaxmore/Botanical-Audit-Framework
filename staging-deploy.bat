@echo off
REM ============================================================================
REM GACP Platform - Staging Deployment Script
REM ============================================================================
echo.
echo ====================================
echo   GACP Platform Staging Deployment
echo ====================================
echo.

REM Check Node.js version
echo [1/7] Checking Node.js version...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Set staging environment
echo [2/7] Setting staging environment...
set NODE_ENV=staging
set PORT=3004

REM Install backend dependencies
echo [3/7] Installing backend dependencies...
cd apps\backend
call pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

REM Setup staging environment
echo [4/7] Setting up staging environment...
if not exist .env.staging (
    echo Creating .env.staging from template...
    copy ..\..\env.example .env.staging
    echo IMPORTANT: Please edit .env.staging with your staging configuration
)

REM Load staging environment
echo [5/7] Loading staging environment...
set DOTENV_CONFIG_PATH=.env.staging

REM Start backend server
echo [6/7] Starting backend server in staging mode...
echo Server will start on http://localhost:3004
echo Press Ctrl+C to stop the server
echo.
node atlas-server.js

REM Cleanup on exit
echo [7/7] Staging deployment completed.
pause