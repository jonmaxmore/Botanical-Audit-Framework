@echo off
echo.
echo ========================================
echo   GACP Platform - System Diagnosis
echo ========================================
echo.

echo 🔍 กำลังตรวจสอบระบบ...
echo.

REM Check Windows version
echo 📋 ข้อมูลระบบ:
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo    Windows Version: %VERSION%

REM Check system architecture
echo    Architecture: %PROCESSOR_ARCHITECTURE%

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% == 0 (
    echo    Admin Rights: ✅ Yes
) else (
    echo    Admin Rights: ❌ No
)
echo.

REM Check Node.js
echo 🔍 ตรวจสอบ Node.js:
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo    Node.js: ✅ Installed
    node --version
    npm --version
) else (
    echo    Node.js: ❌ Not Installed
    echo    👉 ดาวน์โหลดจาก: https://nodejs.org
)
echo.

REM Check Docker
echo 🔍 ตรวจสอบ Docker:
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo    Docker: ✅ Installed
    docker --version
) else (
    echo    Docker: ❌ Not Installed
)
echo.

REM Check WSL
echo 🔍 ตรวจสอบ WSL:
wsl --status >nul 2>&1
if %errorlevel% equ 0 (
    echo    WSL: ✅ Available
    wsl --status
) else (
    echo    WSL: ❌ Not Available
)
echo.

REM Check Hyper-V (requires admin)
echo 🔍 ตรวจสอบ Hyper-V:
net session >nul 2>&1
if %errorLevel% == 0 (
    dism /online /get-features | findstr "Microsoft-Hyper-V" | findstr "Enabled" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    Hyper-V: ✅ Enabled
    ) else (
        echo    Hyper-V: ❌ Disabled or Not Available
        echo    👉 Windows 10 Home ไม่รองรับ Hyper-V
    )
) else (
    echo    Hyper-V: ❓ ต้องการสิทธิ Admin เพื่อตรวจสอบ
)
echo.

echo ========================================
echo   📋 สรุปและคำแนะนำ
echo ========================================
echo.

REM Recommendations based on findings
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js พร้อมใช้งาน!
    echo 👉 สามารถรัน GACP Platform ได้เลย:
    echo    1. node server.mjs
    echo    2. node gacp-simple-server.mjs  
    echo    3. cd apps\backend && npm install && node atlas-server.js
    echo.
) else (
    echo ❌ ต้องติดตั้ง Node.js ก่อน
    echo.
    echo 🎯 วิธีแก้ไขที่แนะนำ:
    echo.
    echo 1. ติดตั้ง Node.js (ง่ายที่สุด):
    echo    👉 https://nodejs.org
    echo    👉 เลือก LTS version
    echo    👉 ดาวน์โหลด Windows Installer x64
    echo.
    
    docker --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo 2. หากต้องการ Docker:
        echo    👉 Windows 10 Home ต้องใช้ WSL2
        echo    👉 อัพเกรดเป็น Windows 10 Pro/Education
        echo    👉 หรือติดตั้ง WSL2 ก่อน
        echo.
    )
)

echo 📖 ดูคำแนะนำละเอียดใน:
echo    - INSTALLATION_TROUBLESHOOTING.md
echo    - COMPLETE_SETUP_GUIDE.md
echo.

echo กด Enter เพื่อปิดหน้าต่างนี้
pause >nul