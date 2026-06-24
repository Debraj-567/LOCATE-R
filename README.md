# LOCATE-R — QR + GPS Employee Attendance Platform

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

---

## Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and secrets

npm install
npm run db:generate
npm run db:migrate
npm run db:seed        # Creates admin@locate-r.com / Admin@123456
npm run dev
```

Server runs on **http://localhost:3001**

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on **http://localhost:5173**

The Vite dev server proxies `/api/*` → `http://localhost:3001`.

---

## Default Credentials (after seed)

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@locate-r.com     |
| Password | Admin@123456           |
| Role     | ADMIN                  |

---

## Architecture

```
Clean Architecture:
  Domain      → Entities, Repository interfaces (no dependencies)
  Application → Use cases, services (depends on domain only)
  Infrastructure → Prisma implementations (depends on domain)
  Presentation   → Express controllers, routes, middleware
```

## Security Features

- JWT access tokens (15min) + refresh tokens (7 days) with rotation
- HMAC-SHA256 signed QR tokens
- 30-second QR expiration
- One-time-use QR (replay attack prevention via DB flag)
- Haversine GPS geofence validation (server-side)
- Configurable radius per office (10m–500m)
- Helmet, CORS, rate limiting on auth routes
- Role-based access control (ADMIN / EMPLOYEE)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| POST | /api/auth/refresh | — | Refresh tokens |
| POST | /api/auth/logout | ✓ | Logout |
| GET | /api/auth/me | ✓ | Current user |
| POST | /api/attendance/check-in | ✓ | QR + GPS check-in |
| POST | /api/attendance/check-out | ✓ | Check out |
| GET | /api/attendance/my | ✓ | My history |
| GET | /api/attendance/today | ✓ | Today status |
| GET | /api/attendance | ADMIN | All records |
| GET | /api/attendance/stats | ADMIN | Analytics |
| POST | /api/qr/generate/:officeId | ADMIN | Generate QR |
| GET | /api/offices | ✓ | List offices |
| POST | /api/offices | ADMIN | Create office |
| PATCH | /api/offices/:id | ADMIN | Update office |
| DELETE | /api/offices/:id | ADMIN | Deactivate office |
| GET | /api/users | ADMIN | List users |
| PATCH | /api/users/:id | ADMIN | Update user |
| DELETE | /api/users/:id | ADMIN | Deactivate user |
