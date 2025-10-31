# EventHub — College Event Management Platform

A modern full‑stack web app to manage college events, clubs, classrooms, and analytics. Built with React + TypeScript + Vite, Tailwind (shadcn/ui), Node.js/Express, and Oracle Database 23c Free.

> Demo-ready: Includes one-click startup scripts, smart venue booking (no double bookings), glowing UI cards, a personalized dashboard hero, and insightful analytics.

## ✨ Features
- Personalized dashboard with animated greeting and scroll-triggered sections
- Smart venue booking — prevents overlaps across all days and times
- Clubs directory with per-club events, creation, and deletion
- Classrooms view with availability, booking, and cascade delete (booking → event)
- Events listing with rich cards, filters, and organizer club display
- Analytics dashboard with category breakdown, trends, performance, engagement
- Consistent global navigation and modern UI (Poppins, gradients, glass, glow)
- Canvas background effects (Three.js / React Three Fiber)

## 🧰 Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons
- Backend: Node.js, Express
- Database: Oracle Database 23c Free (thin driver)
- 3D/Effects: three, @react-three/fiber

## 📦 Project Structure
```text
.
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ events/
│  │  └─ ui/                 # shadcn components + custom UI (hero, glow, canvas)
│  ├─ hooks/
│  ├─ integrations/
│  │  └─ oracle/
│  ├─ pages/                 # Dashboard, Events, Clubs, Classrooms, Analytics, etc.
│  ├─ lib/
│  └─ main.tsx
├─ oracle-api-server.js      # Express API server (Oracle DB)
├─ oracle-migrations/        # SQL migration scripts
├─ start-all-servers.ps1     # Start backend + frontend in two windows
├─ START_DEMO.bat            # One-click demo starter (calls the PowerShell script)
├─ DEMO_GUIDE.md             # Detailed demo/runbook
├─ DEMO_QUICK_REFERENCE.md   # One-page cheat sheet with commands
├─ tailwind.config.ts
├─ vite.config.ts
└─ package.json
```

## 🚀 Getting Started

### 1) Prerequisites
- Windows 10/11 recommended
- Oracle Database 23c Free installed and running
- Node.js LTS (18+)

Verify tools:
```powershell
node --version
npm --version
```

### 2) Clone
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd eventhub-book-app-main
```

### 3) Install dependencies
```bash
npm install
```

### 4) Start the servers

Option A — One-click starter (recommended for demo)
```powershell
START_DEMO.bat
```
This opens two PowerShell windows and starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:8080

Option B — Manual
```powershell
# Terminal 1 (Backend)
$env:PATH += ";C:\\Program Files\\nodejs"; node oracle-api-server.js

# Terminal 2 (Frontend)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; `
  $env:PATH += ";C:\\Program Files\\nodejs"; npm run dev
```
Then open `http://localhost:8080` in your browser.

## 🔐 Environment & Configuration
- Oracle connection config is embedded in `oracle-api-server.js` for local demo use:
  - user: `system`, connectString: `localhost:1521/free`
- Adjust credentials/connection string there if your setup differs.

## 🧪 Demo Flow (Suggested)
1. Dashboard → greeting animation, key metrics, upcoming events
2. Events → glowing cards, create event (with club + venue availability), verify organizer club shown
3. Clubs → add, delete, view events by club
4. Classrooms → availability, book classroom, delete booking (also deletes event)
5. Analytics → category breakdown, trends, growth, engagement, resources

More detail in:
- `DEMO_GUIDE.md` (full runbook with troubleshooting)
- `DEMO_QUICK_REFERENCE.md` (one page commands)

## 🗃️ Database Overview
Tables (representative):
- `CLUBS_1` — id, name, description, coordinator_email (NOT NULL), coordinator_contact (NOT NULL)
- `CLASSROOMS_1` — id, room_number, building, capacity
- `EVENTS_1` — id, event_id, title, event_date, start_time, end_time, venue_id, club_id, category
- `CLASSROOM_BOOKINGS_1` — id, classroom_id, event_id, start_time, end_time, booking_date

Key logic:
- Overlap detection uses `TO_TIMESTAMP` and correct inequality ranges for both bookings and events
- Venue availability endpoint excludes any classroom not free for the entire time range
- Deleting a booking deletes the associated event

Migrations and helper SQL:
- See `oracle-migrations/` and top-level `*.sql` files

## 🔌 API Endpoints (Backend)
Base URL: `http://localhost:3001`

- Classrooms
  - GET `/api/classrooms`
  - POST `/api/classrooms`
  - DELETE `/api/classrooms/:id`
- Clubs
  - GET `/api/clubs`
  - POST `/api/clubs`
  - DELETE `/api/clubs/:id`
- Events
  - GET `/api/events` (includes `CLUB_NAME` via join)
  - POST `/api/events` (uses `club_id`)
  - DELETE `/api/events/:id`
- Classroom Bookings
  - GET `/api/classroom-bookings`
  - POST `/api/classroom-bookings`
  - DELETE `/api/classroom-bookings/:id` (also deletes related event)
- Health
  - GET `/api/health`

## 🖥️ Scripts
- `npm run dev` — start Vite dev server (frontend)
- `start-all-servers.ps1` — start backend + frontend (PowerShell)
- `START_DEMO.bat` — friendly wrapper to launch PowerShell script

## 🧩 UI/UX Highlights
- Poppins font across the app (configured in `index.css` + Tailwind theme)
- Hero section with subtle dark blue radial glow and staggered entrance animations
- Glowing card borders (no text glitch, radius matched), consistent 4-column grids
- Canvas reveal/particle backgrounds on key pages
- Button micro-interactions (expandIcon variant, hover-only icon motion)

## 🛠️ Troubleshooting
- npm scripts blocked  
  Use: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force`
- "localhost refused to connect"  
  Ensure both servers are running; check PowerShell logs for successes
- ORA-00904: "CLUB_NAME": invalid identifier  
  Fixed: events use `club_id`; selects explicitly include `cl.NAME as CLUB_NAME`
- Double bookings  
  Fixed: All availability checks use `TO_TIMESTAMP` with correct overlap ranges
- Ports in use  
  Kill Node processes: `Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force`

More tips in `DEMO_GUIDE.md`.

## 📸 Screenshots (optional)
Add screenshots or GIFs here to showcase:
- Dashboard greeting + cards
- Events grid with glowing borders
- Clubs → Events by club subpage
- Analytics insights

## 📜 License
This project is for academic demonstration purposes. Add a license if you plan to open-source.

## 🙌 Acknowledgements
- shadcn/ui for composable UI primitives
- Lucide Icons
- Framer Motion for animations
- Oracle Database 23c Free
- Three.js / React Three Fiber for background effects

---

If you find this useful, ⭐ the repo and share your feedback!
