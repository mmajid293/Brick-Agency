# Smart Brick Agency — Complete Project Overview

**PDF download:** [Smart-Brick-Agency-Project-Overview.pdf](./Smart-Brick-Agency-Project-Overview.pdf)  
**Regenerate PDF:** `npm run docs:pdf`

**Product name:** Smart Brick Agency (Smart Bhatha ERP)  
**Purpose:** Full management system for a Pakistani brick kiln / brick agency (بھٹہ) — production, workers, sales, dispatch, finance, and payroll.  
**Version:** 0.1.0  
**Default URL:** http://localhost:3000

---

## 1. Languages & technologies used

| Layer | Technology | Role in this project |
|--------|------------|----------------------|
| **TypeScript** | Primary language | All app logic, APIs, UI components, types |
| **JavaScript** | Runtime | Node.js runs the compiled/bundled app |
| **React 19** | UI library | Screens, forms, tables, dashboards |
| **Next.js 16** | Web framework | Pages, routing, API routes, server components |
| **HTML / JSX** | Markup | Page structure inside React |
| **CSS** | Styling | Via **Tailwind CSS 4** utility classes |
| **SQL** | Database | **PostgreSQL** (queries via Prisma, not hand-written SQL files) |
| **Prisma Schema** | ORM DSL | `prisma/schema.prisma` — tables, relations, enums |
| **JSON** | Data exchange | API request/response bodies |
| **Zod** | Validation | Form and API input validation |
| **PowerShell / Bash** | Scripts | Windows/Linux database setup and launchers |
| **Docker Compose** | YAML | PostgreSQL container definition |
| **Urdu + English** | Content | UI strings in `src/lib/i18n.ts` (not a programming language) |

### Main libraries (not separate languages)

- **Radix UI** — accessible dialogs, selects, tabs  
- **Framer Motion** — animations  
- **Recharts** — dashboard charts  
- **bcryptjs + jose** — password hashing and JWT sessions  
- **jsPDF + xlsx** — PDF and Excel exports  
- **date-fns** — dates for attendance and payroll  
- **Lucide React** — icons  

---

## 2. New Windows PC — full setup guide

### What you must install

| Software | Why | Download |
|----------|-----|----------|
| **Node.js 20 LTS or newer** | Runs the app | https://nodejs.org/ |
| **Docker Desktop** | Runs PostgreSQL easily | https://www.docker.com/products/docker-desktop/ |
| **Git** (optional) | Clone the project | https://git-scm.com/ |
| **Google Chrome or Microsoft Edge** | Use and “install” the app | Preinstalled on Windows |

Verify in **PowerShell**:

```powershell
node -v    # should show v20.x or v22.x
npm -v
docker -v
```

### First-time project setup

1. Copy or clone the project folder, e.g. `C:\Projects\smart-bhatha-erp`
2. Open **PowerShell** in that folder:

```powershell
cd C:\Projects\smart-bhatha-erp
npm install
copy .env.example .env
powershell -ExecutionPolicy Bypass -File scripts\setup-db.ps1
```

This will:

- Install npm packages  
- Start PostgreSQL in Docker on port **5434**  
- Create all database tables  
- Load demo workers, customers, orders, kilns, agents, etc.  

3. Start the app:

```powershell
npm run dev
```

4. Open browser: **http://localhost:3000**

### Daily use on Windows (easiest)

1. Start **Docker Desktop** (wait until running).  
2. Double-click **`Start-SmartBhatha.bat`** in the project folder.  
3. Leave the black **server window** open.  
4. Browser opens automatically — log in.  
5. Optional: pin as desktop app (see section 3).

### Production mode (faster, no code reload)

```powershell
npm run build
npm run start
```

### Environment file (`.env`)

| Variable | Example | Meaning |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://bhatha:bhatha123@localhost:5434/smart_bhatha` | Database connection |
| `JWT_SECRET` | long random string | Session security (change in production) |
| `JWT_EXPIRES_IN` | `7d` | Login session length |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | App URL for links |

### Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run db:setup` | DB + tables + seed (Linux/Mac script) |
| `npm run db:setup:win` | Same on Windows (PowerShell) |
| `npm run db:seed` | Reload demo data only |
| `npm run db:studio` | Visual database browser |
| `npm run lint` | Code quality check |

### Other PCs on same Wi‑Fi/LAN

1. On server PC: `ipconfig` → note IPv4 (e.g. `192.168.1.50`).  
2. Allow **port 3000** in Windows Firewall.  
3. On other PCs: open `http://192.168.1.50:3000`  
4. Server PC must keep Docker + `npm run dev` (or `npm run start`) running.

---

## 3. How to use it as an app (desktop-like)

This is a **web application** that runs on your computer. It is not a separate `.exe` installer, but you can use it like desktop software.

### Option A — Browser bookmark

Always open: **http://localhost:3000** after starting the server.

### Option B — Install as app (recommended)

**Microsoft Edge**

1. Start the server (`Start-SmartBhatha.bat` or `npm run dev`).  
2. Open http://localhost:3000 and log in.  
3. Menu **⋯** → **Apps** → **Install this site as an app**.  
4. Name: **Smart Brick Agency**.  
5. Pin to taskbar.

**Google Chrome**

1. Open http://localhost:3000.  
2. Click **Install** in the address bar (or ⋮ → **Install app**).  
3. Pin from Start menu.

> The installed app is a dedicated window to your **local** server. You must still run Docker + the Node server (`Start-SmartBhatha.bat`) each time you use the PC.

### Option C — Desktop shortcut to launcher

Right-click **`Start-SmartBhatha.bat`** → **Send to** → **Desktop (create shortcut)**.

---

## 4. Login accounts (after seed)

| Role | Email | Password | What they can do |
|------|-------|----------|------------------|
| **Admin** | admin@bhatha.pk | admin123 | Everything + users + audit |
| **Manager** | manager@bhatha.pk | manager123 | Full operations & sales |
| **Accountant** | accountant@bhatha.pk | accountant123 | Finance, payroll, invoices, customers |
| **Supervisor** | supervisor@bhatha.pk | supervisor123 | Floor: workers, attendance, production, dispatch |
| **Worker** | worker@bhatha.pk | worker123 | Worker portal only (own attendance & pay) |

Change passwords in **Settings** after first login.

---

## 5. Complete feature list

### A. Dashboard & reporting

| Feature | Description |
|---------|-------------|
| **Home dashboard** | KPIs: bricks today, attendance, sales, kiln temp, fuel, alerts |
| **Today report** | Detailed daily snapshot |
| **Reports export** | PDF / Excel (attendance, finance, workers, inventory) |
| **Activity / audit log** | Who changed what (admin) |
| **Urdu / English** | Language toggle, RTL for Urdu |
| **Dark / light theme** | Theme switch |
| **Notifications** | Low stock, dispatch, kiln alerts |

### B. Workforce (16 worker groups)

| Group examples | Wage types supported |
|----------------|----------------------|
| Brick molding, Clay/mitti, Kiln fireman, Wood fuel, Brick loaders, Tractor/truck drivers, Coal, Water pump, Helpers, Supervisor, Mechanic, Security, Electrician, Dispatch staff, Cleaning | Daily, monthly, per 1000 bricks, per truck, shift |

| Feature | Description |
|---------|-------------|
| **Workers hub** | Cards by department; open each group |
| **Worker CRUD** | CNIC, phone, wages, targets, supervisor, category |
| **Departments & categories** | Production, kiln, transport, admin, etc. |
| **Workforce stats** | Counts per category |

### C. Attendance (حاضری)

| Feature | Description |
|---------|-------------|
| **Attendance hub** | By work group (same cards as workers) |
| **Check-in / check-out** | Time, status, overtime hours |
| **Work reports** | Bricks molded, wood tons, truck loads, etc. (per job type) |
| **QR check-in panel** | Supervisor scans worker QR |
| **Bricks on checkout** | Feeds production logs for piece-rate payroll |

### D. Production & kiln

| Feature | Description |
|---------|-------------|
| **Daily production** | Raw, cooked, Grade A/B, broken, wastage |
| **Kiln temperature logs** | Fuel type (wood, coal, wood waste) |
| **Multi-kiln** | Kiln #1, #2, etc. |
| **Kiln batches** | LOADING → FIRING → COOLING → UNLOADED |
| **Inventory sync** | Production updates brick stock by grade |

### E. Inventory & materials

| Feature | Description |
|---------|-------------|
| **Brick inventory** | RAW, COOKED, GRADE_A, GRADE_B, BROKEN |
| **Stock in/out/transfer/wastage** | Movement history |
| **Raw materials** | Mitti, coal, wood, wood waste, diesel, water, sand |
| **Stock history** | Previous vs current stock |
| **Suppliers & purchases** | Record buys, update stock |
| **Low-stock alerts** | Minimum levels |

### F. Sales & customers (brick agency)

| Feature | Description |
|---------|-------------|
| **Customers** | Builder, contractor, retailer, wholesaler, government |
| **Orders** | Grade, rate, quantity, status, payment |
| **Quotations** | Order status `QUOTATION` |
| **Credit limit** | Block order if udhar exceeds limit |
| **Customer balance** | Udhar tracking, receive payments |
| **Sales agents** | Agent code, commission % |
| **Agent commission** | Auto on orders linked to agent |
| **Rate card** | Master brick prices by grade & customer type |
| **Tax invoices** | Issue invoice per order (NTN optional) |

### G. Dispatch & logistics

| Feature | Description |
|---------|-------------|
| **Dispatch register** | All truck dispatches |
| **New dispatch** | Multi-truck from pending orders |
| **Auto challan numbers** | Unique delivery challan |
| **Print challan** | Customer, grade, truck, driver |
| **Bilty & freight** | Transporter, bilty no, freight amount |
| **Delivery status** | Pending → in transit → delivered |
| **Fleet / vehicles** | Registration, driver, capacity |
| **Stock deduction** | Inventory reduced on dispatch |

### H. Finance & payroll

| Feature | Description |
|---------|-------------|
| **Transactions** | Income, expense, salary, customer/supplier payments |
| **Expenses** | Categories (fuel, maintenance, etc.) |
| **Payroll records** | Monthly per worker |
| **Auto payroll** | From attendance + piece-rate + OT + truck trips |
| **Advance (peshgi)** | Deduction on payroll; balance updated when paid |
| **Mark paid** | Creates salary transaction |

### I. Worker portal

| Feature | Description |
|---------|-------------|
| **Own profile** | CNIC, wages, department |
| **Today attendance** | Check-in/out from portal |
| **Attendance history** | Last 30 days |
| **Payroll view** | Past pay slips |
| **Advances** | Balance shown |

### J. Settings & security

| Feature | Description |
|---------|-------------|
| **User management** | Create users, roles, link worker |
| **Change password** | All users |
| **JWT login** | Secure sessions |
| **Role-based access** | Menu and API restricted by role |
| **Rate limiting** | Login protection |

---

## 6. Database models (summary)

| Area | Main tables |
|------|-------------|
| Users & auth | User, AuditLog |
| Organization | Department, WorkerCategory |
| HR | Worker, Attendance, Payroll, Advance, WorkerProductionLog, WorkerDispatchLog |
| Production | Production, Kiln, KilnBatch, KilnLog, WeatherLog |
| Stock | BrickInventory, InventoryMovement, RawMaterial, MaterialStockLog, Supplier, Purchase |
| Sales | Customer, Order, SalesAgent, AgentCommission, BrickRateCard, Invoice |
| Logistics | Vehicle, Dispatch |
| Finance | Transaction, Expense, Notification |

---

## 7. Project folder structure

```
smart-bhatha-erp/
├── prisma/
│   ├── schema.prisma      # Database design
│   ├── seed.ts            # Demo data entry
│   ├── seed-data.ts       # Workers, customers
│   ├── seed-workforce.ts  # Departments & categories
│   ├── seed-agency.ts     # Kilns, agents, rates, users
│   └── seed-demo-*.ts     # Extra demo records
├── scripts/
│   ├── setup-db.ps1       # Windows DB setup
│   ├── setup-db.sh        # Linux/Mac DB setup
│   └── start-db.sh        # Start Postgres container
├── src/
│   ├── app/
│   │   ├── api/           # REST APIs (~45 routes)
│   │   ├── dashboard/   # ERP screens
│   │   ├── login/
│   │   └── page.tsx       # Landing page
│   ├── components/        # UI (workers, dispatch, payroll, …)
│   ├── lib/               # Auth, payroll-calc, i18n, validations
│   └── context/           # Locale, role
├── public/                # Logo, icons, PWA manifest
├── .env.example
├── Start-SmartBhatha.bat  # Windows one-click launcher
├── WINDOWS.md             # Windows guide (short)
├── README.md
└── package.json
```

---

## 8. System requirements (recommended)

| Item | Minimum |
|------|---------|
| OS | Windows 10/11 (64-bit) |
| RAM | 8 GB (16 GB better with Docker) |
| Disk | 2 GB free (node_modules + Docker image) |
| CPU | Any modern dual-core |
| Network | Local only; optional LAN for other PCs |
| Browser | Chrome 120+, Edge 120+, or Firefox |

---

## 9. What this project is NOT (yet)

- Not a mobile native app (Android/iOS) — use browser or installed PWA  
- Not multi-branch cloud SaaS out of the box — single bhatha per install  
- Not full FBR/e-invoicing integration — basic invoice records only  
- Not weighbridge hardware integration  
- AI forecast / offline PWA mentioned in old marketing copy — limited or not active  

---

## 10. Quick workflow (typical day)

1. **Supervisor** — Mark attendance, check-out with bricks/loads.  
2. **Production** — Enter daily bricks; advance kiln batches.  
3. **Sales** — Create order (rate from rate card); assign agent.  
4. **Dispatch** — Load trucks, print challan, bilty.  
5. **Accountant** — Receive payments; run **auto payroll** at month end; mark paid.  
6. **Manager** — Dashboard + today report + exports.  

---

*Document generated for Smart Brick Agency ERP — Pakistani brick kiln / agency management.*
