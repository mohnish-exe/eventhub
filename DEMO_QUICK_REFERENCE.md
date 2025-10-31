# 📋 EventHub Demo - Quick Reference Card

## 🚀 START COMMANDS (Copy-Paste Ready)

### Terminal 1 (Backend):
```powershell
$env:PATH += ";C:\Program Files\nodejs"; node oracle-api-server.js
```
✅ **Success**: Look for "🚀 Oracle API server running on http://localhost:3001"

---

### Terminal 2 (Frontend):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; $env:PATH += ";C:\Program Files\nodejs"; npm run dev
```
✅ **Success**: Look for "➜  Local:   http://localhost:8080/"

---

## 🌐 OPEN WEBSITE
**URL**: `http://localhost:8080`

**Login**:
- Email: `demo@eventhub.com`
- Password: `demo123`

---

## 📍 DEMO FLOW (5-10 minutes)

1. **Dashboard** → Show statistics, greeting, activity
2. **Events** → Create event, show glowing cards
3. **Clubs** → View clubs, filter events by club
4. **Classrooms** → Book classroom, show availability
5. **Analytics** → Show graphs, trends, insights

---

## 🎯 KEY HIGHLIGHTS

✨ **Smart Venue Booking** - No double bookings  
✨ **Real-time Data** - Live dashboard updates  
✨ **Modern UI** - Glowing cards, animations  
✨ **Club Integration** - Events linked to clubs  
✨ **Analytics** - Visual insights & trends  

---

## 🛑 STOP SERVERS

Press `Ctrl + C` in both PowerShell windows

---

## ⚠️ QUICK FIXES

**Can't connect?** → Check Oracle Database is running  
**Port in use?** → Close node.exe in Task Manager  
**Changes not showing?** → Refresh browser (Ctrl + R)  

---

## 📞 EMERGENCY RESTART

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```
Then start both servers again.

---

**Good Luck! 🎉**



