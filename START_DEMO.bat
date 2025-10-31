@echo off
cls
echo ========================================
echo    EventHub - Quick Demo Starter
echo ========================================
echo.
echo This will start BOTH servers in separate windows.
echo.
echo Instructions:
echo 1. Two PowerShell windows will open
echo 2. Wait for both to show success messages
echo 3. Open browser to http://localhost:8080
echo.
echo Press any key to start...
pause >nul

echo.
echo Starting servers...
powershell.exe -ExecutionPolicy Bypass -File "start-all-servers.ps1"

echo.
echo ========================================
echo    Servers should now be running!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:8080
echo.
echo Open your browser to: http://localhost:8080
echo.
echo Press any key to exit...
pause >nul



