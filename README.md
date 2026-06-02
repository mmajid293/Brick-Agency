# Smart Bhatha ERP 🧱

**Complete management system for Pakistani brick kilns. (بھٹہ)** — workers, production, finance, dispatch, and Urdu support.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC)

## Features

- **Dashboard** — Live bricks produced, workers present, sales, kiln temperature, fuel, dispatches
- **Worker Management** — 50+ workers, CNIC, attendance, payroll, advances, QR check-in
- **Brick Inventory** — Raw, cooked, A/B grade, wastage, kiln cycles
- **Raw Materials** — Mitti, coal, wood, diesel with stock alerts
- **Finance** — PKR ledger, expenses, profit/loss, invoices (Urdu ready)
- **Customers & Dispatch** — Orders, challan, truck tracking
- **Reports** — PDF/Excel export ready
- **Urdu/English** toggle with Noto Nastaliq Urdu typography
- **Dark mode**, PWA manifest, JWT auth with roles

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + Radix UI + Framer Motion + Recharts
- PostgreSQL + Prisma ORM
- JWT authentication + role-based access

## Quick Start

**Windows users:** see **[WINDOWS.md](WINDOWS.md)** — double-click `Start-SmartBhatha.bat` after first-time setup.

**Full project overview (PDF):** [docs/Smart-Brick-Agency-Project-Overview.pdf](docs/Smart-Brick-Agency-Project-Overview.pdf) — generate with `npm run docs:pdf`

### 1. Prerequisites

- Node.js 20+
- Docker (for PostgreSQL) or local Postgres

### 2. Install

```bash
cd smart-bhatha-erp
npm install
cp .env.example .env
```

### 3. Start Database

```bash
npm run db:setup
# or: ./scripts/setup-db.sh
```

This starts PostgreSQL on **localhost:5434** (avoids conflicts with system Postgres on 5432 and old containers on 5433).

**Manual steps** if you prefer:

```bash
./scripts/start-db.sh    # uses plain docker run (works when docker-compose v1 fails)
npm run db:push
npm run db:seed
```

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `KeyError: 'ContainerConfig'` with `docker-compose` | Use `./scripts/start-db.sh` instead of `docker-compose up` |
| `port 5433 is already allocated` | Project now uses **5434** — run `docker rm -f smart-bhatha-db` then `./scripts/start-db.sh` |
| `P1000 Authentication failed` for user `bhatha` | Wrong port: ensure `.env` has `localhost:5434`, not `5432`. Re-copy: `cp .env.example .env` |
| Login shows "Database not available" | Run `npm run db:setup` and restart `npm run dev` |

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bhatha.pk | admin123 |
| Manager | manager@bhatha.pk | admin123 |
| Accountant | accountant@bhatha.pk | admin123 |
| Supervisor | supervisor@bhatha.pk | admin123 |
| Worker (portal) | worker@bhatha.pk | admin123 |

## Admin features (Settings)

- **Change password** — all logged-in users (Settings)
- **User management** — create users, assign roles, link worker for portal (Admin only)
- **Activity log** — audit trail of changes (Manager+)
- **QR check-in** — Attendance page (supervisor) + worker QR on portal

## Docker (Full Stack)

```bash
docker compose up --build
```

## Project Structure

```
src/
├── app/
│   ├── api/          # REST API routes
│   ├── dashboard/    # ERP modules
│   ├── login/
│   └── page.tsx      # Landing page
├── components/       # UI & layout
├── lib/              # Auth, Prisma, i18n
└── context/          # Locale provider
prisma/
├── schema.prisma     # Full database schema
└── seed.ts           # Demo data
```

## User Roles

1. **Admin** — Full access
2. **Manager** — Operations & workers
3. **Accountant** — Finance
4. **Supervisor** — Production floor
5. **Worker** — Portal (attendance view)

## Deployment

1. Set production env vars (`DATABASE_URL`, `JWT_SECRET`)
2. Run `npm run build`
3. Run migrations: `npx prisma migrate deploy`
4. Use Docker Compose or deploy standalone output to Vercel/Railway

## License

MIT — Built for Pakistani bhatha owners 🇵🇰
