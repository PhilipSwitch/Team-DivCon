@echo off
echo ==========================================
echo PLANSMART Frontend Server
echo ==========================================
echo.

REM Change to frontend directory
cd /d %~dp0

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Start the frontend HTTP server
echo.
echo Starting HTTP server for frontend...
echo Frontend will be available at http://localhost:3000
echo Login page: http://localhost:3000/login.html
echo Main page: http://localhost:3000/index.html
echo Press Ctrl+C to stop
echo.

python -m http.server 3000

pause
