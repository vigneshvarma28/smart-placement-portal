@echo off
title Smart Placement Portal - Production Launcher
echo ===================================================
echo   SMART PLACEMENT PORTAL - Production Mode
echo ===================================================
echo.

cd /d "%~dp0"

echo Step 1: Building Frontend...
cd client
if not exist build (
    call npm run build
) else (
    echo Production build found in client/build.
)
cd ..

echo.
echo Step 2: Starting ML Service (Python Flask)...
start "ML Service (Python Flask)" cmd /k "cd /d ""%~dp0ml-service"" && venv\Scripts\python.exe app.py"

echo.
echo Step 3: Launching Production Server...
echo (Serving frontend from client/build on http://localhost:5000)
cd server
set NODE_ENV=production
timeout /t 3 >nul
start http://localhost:5000
node server.js
pause
