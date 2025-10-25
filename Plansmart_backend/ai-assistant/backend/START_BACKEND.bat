@echo off
echo ==========================================
echo PLANSMART Backend Server
echo ==========================================
echo.

REM Change to backend directory
cd /d %~dp0

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Install requirements if needed
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Start the backend
echo.
echo Starting Flask backend server...
echo Server will run on http://localhost:5000
echo Press Ctrl+C to stop
echo.

python app.py

pause
