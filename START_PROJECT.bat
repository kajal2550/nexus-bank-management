@echo off
title NEXUS Bank - Project Launcher
color 0A

echo.
echo  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
echo  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
echo  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
echo  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
echo  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
echo  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
echo.
echo  ============================================
echo   NEXUS Bank Management System - Launcher
echo  ============================================
echo.

:: Check if MongoDB is running
echo [1/3] Checking MongoDB...
sc query MongoDB 2>nul | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo  [!] MongoDB is NOT running.
    echo  [!] Please start MongoDB first:
    echo      - If installed as service: net start MongoDB
    echo      - If using MongoDB Compass, make sure it's connected
    echo      - Or run: mongod --dbpath C:\data\db
    echo.
    choice /M "Kya aap bina MongoDB ke continue karna chahte hain? (No recommended)"
    if errorlevel 2 goto :end
) else (
    echo  [OK] MongoDB is running!
)

echo.
echo [2/3] Starting Node.js Backend (Port 5000)...
start "NEXUS - Node Backend" cmd /k "cd /d "%~dp0node-backend" && echo Starting Node Backend... && node server.js"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting React Frontend (Port 5173)...
start "NEXUS - React Frontend" cmd /k "cd /d "%~dp0frontend" && echo Starting React Frontend... && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo  ============================================
echo   All Services Started!
echo  ============================================
echo.
echo  Frontend (React):   http://localhost:5173
echo  Node Backend (API): http://localhost:5000
echo.
echo  Press any key to open the app in browser...
pause >nul

start http://localhost:5173

:end
echo.
echo  Script completed. Close this window anytime.
pause
