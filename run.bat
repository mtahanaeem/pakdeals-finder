@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "FRONTEND_PORT=3000"

echo ========================================
echo   PakDeals Finder - Starting Application
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Setting up backend...
cd /d "%ROOT%backend"

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Install Python dependencies
echo Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt -q

REM Check if port 3000 is in use, use 3001 if taken
netstat -ano | findstr ":3000 " >nul 2>&1
if not errorlevel 1 (
    set "FRONTEND_PORT=3001"
    echo Port 3000 is in use, using 3001 instead
)

echo [2/4] Installing frontend dependencies...
cd /d "%ROOT%frontend"
call npm install >nul 2>&1

echo [3/4] Starting backend server...
cd /d "%ROOT%backend"
start "PakDeals Backend" cmd /k "call venv\Scripts\activate.bat && python app.py"

echo [4/4] Starting frontend server...
cd /d "%ROOT%frontend"
start "PakDeals Frontend" cmd /k "npm run dev -- --port !FRONTEND_PORT!"

echo.
echo Waiting for servers to start...
timeout /t 10 /nobreak >nul

echo Opening Chrome...
start "" chrome "http://localhost:!FRONTEND_PORT!"

echo.
echo ========================================
echo   PakDeals Finder is running!
echo ========================================
echo.
echo   Frontend:  http://localhost:!FRONTEND_PORT!
echo   Backend:   http://localhost:5000
echo.
echo   Pages:
echo     Home:        http://localhost:!FRONTEND_PORT!
echo     Compare:     http://localhost:!FRONTEND_PORT!/compare
echo     History:     http://localhost:!FRONTEND_PORT!/history
echo     Flash Sales: http://localhost:!FRONTEND_PORT!/flash-sales
echo     Alerts:      http://localhost:!FRONTEND_PORT!/alerts
echo     Pipeline:    http://localhost:!FRONTEND_PORT!/pipeline
echo     About:       http://localhost:!FRONTEND_PORT!/about
echo.
echo   Press any key to exit this window...
echo   (The servers will continue running)
echo ========================================
pause >nul
endlocal
