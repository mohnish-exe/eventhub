# 🚀 HOW TO START EVENTHUB SERVERS

## ⚡ QUICK START (Easiest Method)

### Option 1: Double-Click the Batch File
1. **Double-click** `START_SERVERS.bat` in the project folder
2. Two PowerShell windows will open automatically
3. **DO NOT CLOSE** these windows - they are running your servers!
4. Open your browser to **http://localhost:8080**

### Option 2: Run PowerShell Script
1. Right-click `start-all-servers.ps1`
2. Select "Run with PowerShell"
3. Two PowerShell windows will open automatically
4. Open your browser to **http://localhost:8080**

---

## 🔧 MANUAL START (If scripts don't work)

### Terminal 1: Backend (Oracle API Server)
```powershell
cd C:\Users\mohnish\Downloads\eventhub-book-app-main
$env:PATH += ";C:\Program Files\nodejs"
node oracle-api-server.js
```

**Keep this terminal open!**

### Terminal 2: Frontend (React App)
```powershell
cd C:\Users\mohnish\Downloads\eventhub-book-app-main
$env:PATH += ";C:\Program Files\nodejs"
npm run dev
```

**Keep this terminal open!**

---

## ✅ HOW TO VERIFY SERVERS ARE RUNNING

### Check if Both Servers are Running:
```powershell
Get-Process node
```

You should see **2 Node processes**:
- One for the Oracle API server (port 3001)
- One for the Vite dev server (port 8080)

### Access the Application:
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001/api/health

---

## ❌ TROUBLESHOOTING

### "localhost refused to connect"

**Cause:** One or both servers have stopped.

**Solution:**
1. Double-click `START_SERVERS.bat` again
2. OR manually start both servers as shown above

### "Port already in use"

**Cause:** Previous server process is still running.

**Solution:**
```powershell
# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Then double-click START_SERVERS.bat again
```

### PowerShell script won't run

**Cause:** Execution policy is blocking scripts.

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Then try again.

---

## 📋 WHAT RUNS WHERE

| Server | Port | URL | Purpose |
|--------|------|-----|---------|
| Frontend (Vite) | 8080 | http://localhost:8080 | React application |
| Backend (Oracle API) | 3001 | http://localhost:3001 | Oracle database API |
| Oracle Database | 1521 | localhost:1521/free | Database (must be running) |

---

## ⚠️ IMPORTANT NOTES

1. **DO NOT CLOSE** the PowerShell windows that open - they are running your servers!
2. **Both servers must be running** for the application to work
3. **Oracle Database** must also be running (start Oracle before running EventHub)
4. If you see "localhost refused to connect", it means one or both servers have stopped

---

## 🎯 RECOMMENDED WORKFLOW

1. **Start Oracle Database** (if not already running)
2. **Double-click `START_SERVERS.bat`**
3. **Wait 10 seconds** for both servers to fully start
4. **Open browser** to http://localhost:8080
5. **Keep the PowerShell windows open** while using the app
6. When done, you can close the PowerShell windows to stop the servers

---

## 🆘 STILL HAVING ISSUES?

If the servers keep stopping:

1. Check if Oracle Database is running
2. Check if ports 8080 and 3001 are available
3. Look for error messages in the PowerShell windows
4. Try restarting your computer
5. Make sure Node.js is installed: `node --version`

---

**Last Updated:** October 21, 2025  
**Project:** EventHub - College Event Management System

