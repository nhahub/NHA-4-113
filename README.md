# NHA-4-113
Auto generated repo 113

# Smart Inventory

Full-stack warehouse/inventory management system with role-based access control (RBAC).

## Stack

| Layer    | Tech |
|----------|------|
| Backend  | .NET 9, ASP.NET Core Web API, Clean Architecture (Domain / Application / Infrastructure / WebApi) |
| Database | SQLite (Entity Framework Core) |
| Auth     | JWT Bearer tokens |
| Frontend | React 18 + Vite, React Router v6 |
| Charts   | Recharts |

## Project Structure

```
Smart_Inventory_FullStack_v2/
├── Backend/
│   ├── src/
│   │   ├── Smart.Domain/          # Entities, enums, interfaces
│   │   ├── Smart.Application/     # Services, DTOs, business rules
│   │   ├── Smart.Infrastructure/  # EF Core, repositories, migrations, DB seeding
│   │   └── Smart.WebApi/          # Controllers, JWT config, Program.cs
│   └── test/                      # Unit tests
└── warehouse-dashboard/           # React frontend
    └── src/
        ├── api/                  # fetch wrappers per resource
        ├── context/AuthContext.jsx
        ├── components/           # RequireAuth, RequireRole, shared UI
        ├── pages/                # Login, Dashboard, Products, etc.
        └── routes/AppRoutes.jsx
```

## Features

- **Auth**: Login issues a JWT (8h expiry); every endpoint except `POST /api/auth/login` requires it.
- **Roles**: `Admin` and `Staff`. Admin-only pages/endpoints: Suppliers, Customers, Reports.
- **Resources**: Products, Categories, Suppliers, Customers, Warehouses, Orders — full CRUD.
- **Pagination**: `?page=&pageSize=` on list endpoints (Products/Suppliers/Customers); omitting them returns the full list.
- **Frontend**: Dashboard with live stats/low-stock alerts, CRUD pages with search, toasts, loading skeletons.

## Known Gaps

- Search boxes filter only the currently loaded page (no backend `?search=` param yet).
- No global exception-handling middleware — unhandled errors return raw 500s.
- Test coverage is thin (only `CategoryServiceTests`).
- No CI, no Docker/production config — local dev only.

## Running Locally

### Backend
```bash
cd Backend/src/Smart.WebApi
dotnet run
```
Applies migrations and seeds the database automatically on first run. API listens on `https://localhost:7100`.

### Frontend
```bash
cd warehouse-dashboard
cp .env.example .env   # adjust VITE_API_BASE_URL if backend runs elsewhere
npm install
npm run dev
```
Runs on `http://localhost:5173`.

### Default Login

| Username | Password   | Role  |
|-----------|-----------|-------|
| `admin`   | `Admin@123` | Admin |
| `staff`   | `Staff@123` | Staff |

> Change `Jwt:Key` in `appsettings.json` before deploying anywhere beyond localhost.
