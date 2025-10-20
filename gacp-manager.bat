@echo off
title GACP Platform - Management Console
color 0A

:main
cls
echo.
echo ========================================
echo   🌿 GACP Platform Management Console
echo ========================================
echo.
echo Current Status:
call :check_server_status
echo.
echo Available Options:
echo.
echo 1. 🚀 Start Robust GACP Server
echo 2. 🔄 Start Simple Server  
echo 3. 💪 Start Full GACP Platform
echo 4. 📊 Check Server Status
echo 5. 💚 Health Check
echo 6. 🛑 Stop All Servers
echo 7. 🔧 System Cleanup
echo 8. 📖 View Documentation
echo 9. 🚪 Exit
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto start_robust
if "%choice%"=="2" goto start_simple
if "%choice%"=="3" goto start_full
if "%choice%"=="4" goto check_status
if "%choice%"=="5" goto health_check
if "%choice%"=="6" goto stop_servers
if "%choice%"=="7" goto cleanup
if "%choice%"=="8" goto docs
if "%choice%"=="9" goto exit

echo Invalid choice. Please try again.
pause
goto main

:start_robust
echo.
echo 🚀 Starting Robust GACP Server...
echo.
echo ✅ Features enabled:
echo    - Auto-restart on crash
echo    - Health monitoring (30s intervals)  
echo    - Automatic port detection
echo    - Error recovery and logging
echo    - Graceful shutdown handling
echo    - Real-time metrics tracking
echo.
echo 🌐 Will be available at:
echo    - Main: http://127.0.0.1:3000
echo    - Demo: http://127.0.0.1:3000/demo
echo    - Health: http://127.0.0.1:3000/api/health
echo    - Status: http://127.0.0.1:3000/api/status
echo.
echo Press Ctrl+C to stop server
echo.
node robust-gacp-server.mjs
pause
goto main

:start_simple
echo.
echo 🔄 Starting Simple Server...
echo.
node server.mjs
pause
goto main

:start_full
echo.
echo 💪 Starting Full GACP Platform...
echo.
echo Installing dependencies...
cd apps\backend
npm install
echo.
echo Starting atlas-server...
node atlas-server.js
cd ..\..
pause
goto main

:check_status
echo.
echo 📊 Checking Server Status...
echo.

REM Check Node.js processes
echo 🔍 Node.js Processes:
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr node.exe || echo    No Node.js processes found

echo.
REM Check ports
echo 🔍 Port Usage:
echo Port 3000:
netstat -ano | findstr :3000 || echo    Port 3000 is available

echo Port 3004:
netstat -ano | findstr :3004 || echo    Port 3004 is available

echo.
pause
goto main

:health_check
echo.
echo 💚 Health Check...
echo.

REM Try to connect to servers
echo Testing http://127.0.0.1:3000/api/health...
curl http://127.0.0.1:3000/api/health -UseBasicParsing 2>nul && echo ✅ Port 3000 - Healthy || echo ❌ Port 3000 - Down

echo.
echo Testing http://127.0.0.1:3004/api/monitoring/health...
curl http://127.0.0.1:3004/api/monitoring/health -UseBasicParsing 2>nul && echo ✅ Port 3004 - Healthy || echo ❌ Port 3004 - Down

echo.
pause
goto main

:stop_servers
echo.
echo 🛑 Stopping All Servers...
echo.

REM Kill Node.js processes
taskkill /F /IM node.exe 2>nul && echo ✅ Node.js processes stopped || echo ❌ No Node.js processes found

echo.
pause
goto main

:cleanup
echo.
echo 🔧 System Cleanup...
echo.

echo Killing Node.js processes...
taskkill /F /IM node.exe 2>nul

echo Clearing DNS cache...
ipconfig /flushdns >nul

echo Cleaning up temp files...
del /q /f "%temp%\node*" 2>nul

echo ✅ System cleanup completed
echo.
pause
goto main

:docs
echo.
echo 📖 Documentation Files:
echo.
echo 1. COMPLETE_SETUP_GUIDE.md - Master setup guide
echo 2. INSTALLATION_TROUBLESHOOTING.md - Installation help
echo 3. DOCKER_SETUP_GUIDE.md - Docker instructions
echo 4. SYSTEM_TROUBLESHOOTING_PLAN.md - Problem resolution
echo 5. QUICK_START_GUIDE.md - Quick reference
echo.

echo Opening COMPLETE_SETUP_GUIDE.md...
start "" COMPLETE_SETUP_GUIDE.md

pause
goto main

:check_server_status
REM Check if servers are running
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr node.exe >nul
if %errorlevel% equ 0 (
    echo    ✅ Node.js servers are running
) else (
    echo    ❌ No servers currently running
)
exit /b

:exit
echo.
echo 👋 Goodbye! Thanks for using GACP Platform
echo.
pause
exit

REM Error handler
:error
echo.
echo ❌ An error occurred. Please check the logs and try again.
echo.
pause
goto main