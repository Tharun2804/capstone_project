@echo off
echo ========================================
echo   Textbook Review System Startup
echo ========================================
echo.

echo 1. Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo 2. Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo 3. Starting the server...
echo.
echo Server will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
node server.js