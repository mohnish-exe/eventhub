# 🎯 EventHub Demo Guide - Step by Step

## 📋 Pre-Demo Checklist (Do This Before the Demo)

### ✅ System Requirements Check
- [ ] Oracle Database is installed and running
- [ ] Node.js is installed (check by opening PowerShell and typing `node --version`)
- [ ] Project folder is at: `C:\Users\mohnish\Downloads\eventhub-book-app-main`

---

## 🚀 Step-by-Step Demo Procedure

### Step 1: Start Oracle Database
**Time: 2-3 minutes before demo**

1. **Open Services** (Windows + R, type `services.msc`, press Enter)
2. **Find** `OracleServiceXE` or `OracleServiceFREE`
3. **Right-click** → **Start** (if not already running)
4. **Wait** for status to show "Running"

> 💡 **Tip**: Do this 5 minutes before the demo to ensure it's ready!

---

### Step 2: Open Project Folder
**Time: 10 seconds**

1. **Press** `Windows + E` (File Explorer)
2. **Navigate to**: `C:\Users\mohnish\Downloads\eventhub-book-app-main`
3. **Alternative**: Copy this path and paste in File Explorer address bar:
   ```
   C:\Users\mohnish\Downloads\eventhub-book-app-main
   ```

---

### Step 3: Open PowerShell in Project Folder
**Time: 5 seconds**

**METHOD 1 (Recommended):**
1. In File Explorer (with project folder open)
2. **Click** on the address bar
3. **Type**: `powershell`
4. **Press** Enter

**METHOD 2:**
1. **Right-click** in empty space in the folder
2. **Select** "Open in Terminal" or "Open PowerShell window here"

---

### Step 4: Start Backend Server (Oracle API)
**Time: 10-15 seconds**

1. In the PowerShell window, **type or copy-paste** this command:
   ```powershell
   $env:PATH += ";C:\Program Files\nodejs"; node oracle-api-server.js
   ```

2. **Press** Enter

3. **Wait for** these messages:
   ```
   ✅ Oracle database connection pool created successfully!
   ✅ Oracle database test query successful: [ 1 ]
   🚀 Oracle API server running on http://localhost:3001
   ```

4. **Success!** Backend is running
   - ⚠️ **DO NOT CLOSE THIS WINDOW**
   - Keep it running in the background

> 💡 **What if it fails?**
> - Check Oracle Database is running (Step 1)
> - Look for error messages about database connection
> - Try restarting Oracle Database service

---

### Step 5: Start Frontend Server
**Time: 20-30 seconds**

1. **Open a NEW PowerShell window** (repeat Step 3)
   - You should now have TWO PowerShell windows open

2. In the NEW window, **type or copy-paste** this command:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; $env:PATH += ";C:\Program Files\nodejs"; npm run dev
   ```

3. **Press** Enter

4. **Wait for** these messages:
   ```
   VITE v5.4.19  ready in XXX ms
   ➜  Local:   http://localhost:8080/
   ➜  Network: http://192.168.x.x:8080/
   ```

5. **Success!** Frontend is running
   - ⚠️ **DO NOT CLOSE THIS WINDOW EITHER**
   - Keep both windows running

---

### Step 6: Open the Website
**Time: 5 seconds**

**METHOD 1 (Automatic):**
- Hold `Ctrl` and click on `http://localhost:8080/` in the terminal

**METHOD 2 (Manual):**
1. **Open** your browser (Chrome, Edge, Firefox)
2. **Type** in address bar: `http://localhost:8080`
3. **Press** Enter

---

### Step 7: Log In
**Time: 10 seconds**

1. You'll see the **Sign In / Sign Up** page
2. **Click** "Sign Up" (if first time) or "Sign In" (if account exists)
3. **Enter** credentials:
   - Email: `demo@eventhub.com` (or your test email)
   - Password: `demo123` (or your test password)

4. **Click** Sign In/Up button

5. **You're in!** The dashboard will load with the "Good Morning/Afternoon/Evening" greeting

---

## 🎬 Demo Flow (Recommended Order)

### 1️⃣ **Dashboard (Landing Page)**
- Show the hero section with personalized greeting
- Scroll down to see dashboard statistics
- Point out:
  - Total Events, Active Clubs, Classrooms
  - Event Categories (Tech/Non-Tech breakdown)
  - Top Clubs rankings
  - Resource Status
  - Recent Activity
  - Upcoming Events

### 2️⃣ **Events Page**
- Click "Events" in navbar
- Show:
  - Beautiful glowing card effects
  - Event cards with all details
  - Filter by category (Tech/Non-Tech)
  - "Create Event" button
  - Demonstrate creating a new event:
    - Title, Date, Time
    - Venue selection (shows only available rooms!)
    - Club selection from dropdown
    - Category selection

### 3️⃣ **Clubs Page**
- Click "Clubs" in navbar
- Show:
  - All active clubs
  - "Add Club" functionality
  - "View Events" for specific club
  - Club-specific event filtering
  - Delete club option

### 4️⃣ **Classrooms Page**
- Click "Classrooms" in navbar
- Show:
  - All available classrooms
  - Room numbers, buildings, capacity
  - Booking status
  - "Book Classroom" functionality
  - View bookings
  - Delete booking (also deletes associated event)

### 5️⃣ **Analytics Page**
- Click "Analytics" in navbar
- Show:
  - Visual statistics and graphs
  - Event trends over time
  - Category breakdown with progress bars
  - Monthly performance
  - Club engagement metrics
  - Classroom utilization

---

## 🎯 Key Features to Highlight

### ✨ Smart Features
1. **Intelligent Venue Booking**
   - Shows only available venues based on date/time
   - Prevents double bookings
   - Real-time availability check

2. **Club Integration**
   - Events linked to organizing clubs
   - Filter events by club
   - Track club activity

3. **Modern UI/UX**
   - Glowing card effects on hover
   - Smooth animations
   - Responsive design
   - Dark theme with professional gradients
   - Poppins font throughout

4. **Data Integrity**
   - Deleting booking automatically deletes event
   - All form fields validated
   - Mandatory fields enforced

5. **Real-time Dashboard**
   - Live statistics
   - Recent activity feed
   - Upcoming events preview
   - Top performing clubs

---

## 🛑 Stopping the Servers (After Demo)

### Step 1: Stop Frontend
1. Go to the PowerShell window running `npm run dev`
2. Press `Ctrl + C`
3. Type `Y` if asked to confirm
4. Close the window

### Step 2: Stop Backend
1. Go to the PowerShell window running `node oracle-api-server.js`
2. Press `Ctrl + C`
3. Close the window

### Step 3: (Optional) Stop Oracle Database
1. Open Services (`services.msc`)
2. Find `OracleServiceXE` or `OracleServiceFREE`
3. Right-click → Stop

---

## ⚠️ Troubleshooting Guide

### Problem: "Cannot connect to database"
**Solution:**
1. Check Oracle Database service is running
2. Restart Oracle Database service
3. Wait 30 seconds and try again

### Problem: "Port 3001 already in use"
**Solution:**
1. Open Task Manager (`Ctrl + Shift + Esc`)
2. Find all `node.exe` processes
3. End all of them
4. Try starting backend again

### Problem: "Port 8080 already in use"
**Solution:**
1. Close any other applications using port 8080
2. Or change port in `vite.config.ts`
3. Restart frontend server

### Problem: "npm: command not found"
**Solution:**
1. Make sure you used the full command with `$env:PATH +=`
2. Verify Node.js is installed: `node --version`

### Problem: "Events not showing"
**Solution:**
1. Make sure backend is running and showing success messages
2. Check browser console (F12) for errors
3. Refresh the page

### Problem: "Glowing cards not visible"
**Solution:**
1. This is normal - glow appears on **hover**
2. Move mouse over the cards to see the glow effect

---

## 📝 Quick Reference Commands

### Backend (Terminal 1):
```powershell
$env:PATH += ";C:\Program Files\nodejs"; node oracle-api-server.js
```

### Frontend (Terminal 2):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; $env:PATH += ";C:\Program Files\nodejs"; npm run dev
```

### Quick Start (Alternative Method):
```powershell
powershell.exe -ExecutionPolicy Bypass -File "start-all-servers.ps1"
```
*(This opens 2 new windows automatically)*

---

## 🎓 Demo Talking Points

### Technical Stack:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: Oracle Database 23c Free
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Key Achievements:
1. Full-stack college event management system
2. Real-time venue availability checking
3. Intelligent booking system (no double bookings)
4. Role-based event organization through clubs
5. Comprehensive analytics and reporting
6. Modern, professional UI with animations
7. Responsive design for all screen sizes

### Database Features:
- Proper relational schema
- Foreign key constraints
- Data integrity checks
- Efficient queries with JOINs
- Date/time overlap detection

---

## 💡 Pro Tips for Demo

1. **Start servers 5 minutes early** to ensure everything is ready
2. **Have test data ready** (create some events/clubs beforehand)
3. **Close unnecessary applications** to free up memory
4. **Use Chrome/Edge** for best compatibility
5. **Have this guide open** on another screen/device
6. **Test everything once** before the actual demo
7. **Keep PowerShell windows visible** to show real-time logs
8. **Zoom in browser** (Ctrl + +) if presenting on a projector

---

## ✅ Pre-Demo Test (Do This 30 Minutes Before)

- [ ] Start Oracle Database
- [ ] Start Backend Server (check for success messages)
- [ ] Start Frontend Server (check for success messages)
- [ ] Open website in browser
- [ ] Log in successfully
- [ ] Create a test event
- [ ] View all pages (Dashboard, Events, Clubs, Classrooms, Analytics)
- [ ] Test one feature from each page
- [ ] Check animations and hover effects work
- [ ] Stop and restart servers to ensure repeatability

---

## 🎉 You're Ready!

Follow this guide step by step, and your demo will go smoothly. Good luck! 🚀

**Last Updated**: October 23, 2025  
**Project**: EventHub - College Event Management System  
**Version**: 1.0 (Demo Ready)



