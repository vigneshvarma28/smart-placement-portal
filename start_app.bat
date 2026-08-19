@echo off
title Smart Placement Portal Launcher
echo ===================================================
echo   SMART PLACEMENT PORTAL - Development Mode
echo ===================================================
echo.

cd /d "%~dp0"

echo 1. Checking ML Service Environment...
if not exist "ml-service\venv\Scripts\python.exe" (
    echo Creating Python virtual environment for ML service...
    python -m venv ml-service\venv
    call ml-service\venv\Scripts\pip.exe install -r ml-service\requirements.txt
)

echo 2. Launching ML Service (Flask on port 5001)...
start "ML Service (Python Flask)" cmd /k "cd /d ""%~dp0ml-service"" && venv\Scripts\python.exe app.py"

echo 3. Launching Backend Server (Node.js Express on port 5000)...
start "Backend Server (Node.js)" cmd /k "cd /d ""%~dp0server"" && npm run dev"

echo 4. Launching Frontend Client (React on port 3000)...
start "Frontend Client (React)" cmd /k "cd /d ""%~dp0client"" && npm start"

echo.
echo ===================================================
echo All services launched!
echo - Frontend UI:  http://localhost:3000
echo - Backend API:  http://localhost:5000
echo - ML Service:   http://localhost:5001
echo.
echo Sample Logins:
echo - Student: alice@example.com / password123
echo - Company: hr@techcorp.com / password123
echo - Admin:   admin@example.com / admin123
echo ===================================================
echo.
timeout /t 5 >nul
start http://localhost:3000
