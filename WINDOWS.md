# Running Smart Bhatha ERP on Windows

This ERP is a **local web app**: Node.js + PostgreSQL run on your PC, and you open it in the browser (or as an installed browser app).

## Prerequisites

1. **[Node.js 20+ LTS](https://nodejs.org/)** — verify: `node -v`
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — for PostgreSQL
3. Project folder, e.g. `C:\smart-bhatha-erp`

## First-time setup

Open **PowerShell** in the project folder:

```powershell
cd C:\smart-bhatha-erp
npm install
powershell -ExecutionPolicy Bypass -File scripts\setup-db.ps1
```

This starts PostgreSQL, creates tables, and loads demo users.

## Daily use — double-click launcher

1. Make sure **Docker Desktop** is installed (it can start automatically).
2. Double-click **`Start-SmartBhatha.bat`** in the project root.

The script will:

- Start PostgreSQL (`docker compose up -d postgres`)
- Open a **server window** (`npm run dev`) — **leave this open**
- Open the ERP in an **app-style window** (Edge or Chrome)

Login: **admin@bhatha.pk** / **admin123**

### Desktop shortcut

1. Right-click `Start-SmartBhatha.bat` → **Send to** → **Desktop (create shortcut)**
2. Optional: right-click shortcut → **Properties** → **Change Icon** (pick any `.ico`)

## Install like a desktop app (taskbar pin)

After the app opens in the browser:

### Microsoft Edge

1. Open `http://localhost:3000` and log in
2. Menu **⋯** → **Apps** → **Install this site as an app**
3. Name: **Smart Brick ERP**
4. Right-click the app on the taskbar → **Pin to taskbar**

### Google Chrome

1. Open `http://localhost:3000`
2. Address bar → **Install** (or menu → **Install Smart Brick…**)
3. Pin from the Start menu or taskbar

> You still need `Start-SmartBhatha.bat` (or the server window) running in the background. The installed “app” is a dedicated browser window to your local server.

## Manual commands (PowerShell)

```powershell
cd C:\smart-bhatha-erp
docker compose up -d postgres
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

### Production-style (faster, no hot reload)

```powershell
npm run build
npm run start
```

## Other computers on the same network

On the main PC:

```powershell
ipconfig
```

Note the IPv4 address (e.g. `192.168.1.50`).

1. Allow **port 3000** in **Windows Defender Firewall** (inbound rule).
2. On other PCs, open: `http://192.168.1.50:3000`

Ensure `NEXT_PUBLIC_APP_URL` in `.env` matches how users access the app if you change host/port.

## Full stack in Docker only

```powershell
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000) and install as app (Edge/Chrome steps above).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `node` is not recognized | Install Node.js LTS and restart PowerShell |
| `docker` is not recognized | Install Docker Desktop; restart PC |
| Docker not running | Start Docker Desktop; wait until it says “Running” |
| Login: database not available | Run `scripts\setup-db.ps1` again |
| Port 5434 in use | `docker compose down` then `docker compose up -d postgres` |
| Port 3000 in use | Close other apps on 3000 or run `set PORT=3001&& npm run dev` |
| Edge/Chrome app does not open | Open `http://localhost:3000` manually |

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bhatha.pk | admin123 |
| Manager | manager@bhatha.pk | admin123 |
| Worker (portal) | worker@bhatha.pk | admin123 |

See [README.md](README.md) for full feature list and API details.
