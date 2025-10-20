@echo off
echo.
echo ========================================
echo   GACP Platform Demo - Standalone Mode
echo ========================================
echo.
echo กำลังเปิด GACP Platform Demo...
echo.

rem เปิดไฟล์ HTML ใน default browser
start "" "%~dp0demo-standalone.html"

echo.
echo ✅ Demo page เปิดแล้ว!
echo.
echo 📋 คุณสมบัติของ Demo นี้:
echo   - แสดงข้อมูล GACP Workflow ทั้งหมด 17 ขั้นตอน
echo   - Critical Control Points (CCPs) 8 จุด
echo   - ระบบคำนวณคะแนนแบบถ่วงน้ำหนัก
echo   - Compliance Framework สำหรับ WHO-GACP
echo.
echo 🚀 วิธีติดตั้งระบบจริง:
echo   1. ติดตั้ง Node.js จาก https://nodejs.org
echo   2. เปิด Command Prompt ไปที่ apps\backend
echo   3. รัน: npm install
echo   4. รัน: node atlas-server.js
echo.
echo กด Enter เพื่อปิดหน้าต่างนี้
pause >nul