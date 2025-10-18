@echo off
cls
echo ========================================
echo   MY IDEAS - Installing dependencies...
echo ========================================
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing Node packages...
    call npm install
    echo.
)

echo ========================================
echo   Starting server...
echo ========================================
echo.

REM Open browser after 2 seconds
start /B timeout /t 2 /nobreak >nul && start http://localhost:3000

REM Start server
call npm start
