@echo off
title Smart Placement Portal Launcher (Vignesh Edition)
echo ===================================================
echo Starting Smart Placement Portal (Local MERN Stack)
echo ===================================================
echo.

cd /d "%~dp0"

echo 1. Starting ML Service (Python)...
start "ML Service" cmd /k "cd /d ""%~dp0ml-service"" && venv\Scripts\python.exe app.py"

echo 2. Starting Backend Server (Node.js)...
start "Backend Server" cmd /k "cd /d ""%~dp0server"" && npm run dev"

echo 3. Starting Client (React)...
start "Client Frontend" cmd /k "cd /d ""%~dp0client"" && npm start"

echo.
echo All services are launching in separate windows:
echo - Backend:    http://localhost:5000
echo - ML Service: http://localhost:5001
echo - Frontend:   http://localhost:3000
echo.
timeout /t 5 >nul
start http://localhost:3000
