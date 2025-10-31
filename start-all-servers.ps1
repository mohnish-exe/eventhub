# EventHub - Start All Servers
# This script starts both the frontend and backend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EventHub - Starting All Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set execution policy for current session
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Add Node to PATH
$env:PATH += ";C:\Program Files\nodejs"

Write-Host "[1/3] Killing any existing Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Oracle API Server (Backend)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; `$env:PATH += ';C:\Program Files\nodejs'; node oracle-api-server.js" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host "[3/3] Starting Frontend Dev Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; `$env:PATH += ';C:\Program Files\nodejs'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ ALL SERVERS STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two new PowerShell windows have opened." -ForegroundColor Yellow
Write-Host "DO NOT CLOSE THEM - they are running your servers!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

