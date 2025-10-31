@echo off
:: EventHub - Quick Start Script
:: Double-click this file to start all servers

echo ========================================
echo   EventHub - Starting All Servers
echo ========================================
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-all-servers.ps1"

pause

