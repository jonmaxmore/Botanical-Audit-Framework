@echo off
REM ========================================
REM GACP Load Testing - Automated Runner
REM ========================================

echo.
echo ========================================
echo   GACP Load Testing
echo ========================================
echo.

REM Check if backend is running
echo Checking backend...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend NOT running!
    echo.
    echo Starting backend in new window...
    start "GACP Backend" cmd /k "cd apps\backend && node atlas-server.js"
    
    echo Waiting 10 seconds for backend to start...
    timeout /t 10 /nobreak >nul
    
    REM Check again
    curl -s http://localhost:3000/health >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Backend failed to start!
        echo Please check the backend window for errors.
        pause
        exit /b 1
    )
)

echo Backend OK!
echo.

REM Run Smoke Test
echo ========================================
echo Running Smoke Test (60 seconds)...
echo ========================================
echo.
node load-tests\scripts\run-load-test.js smoke

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Smoke Test PASSED!
    echo ========================================
    echo.
    
    REM Ask for Load Test
    set /p response="Run Load Test (5 minutes)? [Y/N]: "
    if /i "%response%"=="Y" (
        echo.
        echo Running Load Test...
        node load-tests\scripts\run-load-test.js load
    )
) else (
    echo.
    echo ========================================
    echo   Smoke Test FAILED!
    echo ========================================
    echo.
)

echo.
echo Testing complete!
pause
