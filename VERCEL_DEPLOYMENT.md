# AccessGlobal Monorepo: Full-Stack Setup & Deployment Guide

This repository is structured as a production-grade monorepo containing two React applications and a high-security Node/Express API Gateway with safe Supabase integration:

1. **`apps/frontend`**: Public enterprise eCommerce portal with dynamic catalog, cart drawer, and interactive inquiry modals.
2. **`apps/admin`**: Full-featured eCommerce operations and control dashboard (Chart.js, Recharts, Product/Order/User/Review tables, and Safe Supabase Database management).
3. **`backend`**: Node.js + Express + TypeScript API gateway with military-grade AES-256-GCM vault for Supabase credentials, JWT authentication, and dual-mode resilient storage.

---

## 1. Monorepo Structure

```
Accessglobal/
├── .gitignore
├── package.json               # Root monorepo orchestrator (npm workspaces)
├── VERCEL_DEPLOYMENT.md       # This guide
├── backend/                   # Secure Backend & Supabase Gateway (Port 5000)
│   ├── src/
│   │   ├── config/env.ts      # Master vault key and CORS setup
│   │   ├── controllers/       # Products, Categories, Orders, Users, Supabase, Auth
│   │   ├── data/
│   │   │   ├── initialSeed.ts # Seed catalog, users, orders
│   │   │   └── supabase-schema.sql # Complete DDL with RLS & indexes
│   │   ├── middleware/        # JWT guard, error handler, rate limiter
│   │   ├── routes/            # /api routes
│   │   ├── services/
│   │   │   ├── vault.service.ts      # AES-256-GCM credential vault
│   │   │   ├── supabase.service.ts   # Safe Supabase client manager
│   │   │   └── repository.service.ts # Dual storage (Supabase / local fallback)
│   │   └── index.ts           # Server entrypoint
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── apps/
│   ├── frontend/              # Customer Storefront (Vercel Project 1 - Port 3000)
│   │   ├── vercel.json
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── src/
│   └── admin/                 # Admin Dashboard (Vercel Project 2 - Port 3001)
│       ├── vercel.json
│       ├── vite.config.ts     # Configured with proxy to backend /api
│       ├── package.json
│       └── src/
```

---

## 2. Local Development

You can run any service independently or in parallel:

### Start Development Servers

- **Backend API Server** (runs on `http://localhost:5000`):
  ```bash
  npm run dev:backend
  ```

- **Admin Dashboard** (runs on `http://localhost:3001` with `/api` proxy):
  ```bash
  npm run dev:admin
  ```

- **Frontend Portal** (runs on `http://localhost:3000`):
  ```bash
  npm run dev:frontend
  ```

### Build & Typecheck All Services

- **Build everything**:
  ```bash
  npm run build
  ```

- **Build individually**:
  ```bash
  npm run build:backend
  npm run build:admin
  npm run build:frontend
  ```

---

## 3. Safe Supabase Integration (Zero Public Key Leakage)

### Why this is safe:
- **Never exposed in the browser**: The Supabase `service_role` secret key and raw connection strings are never sent to or stored in client-side code.
- **Server Vault (AES-256-GCM)**: If users input Supabase credentials via the Admin UI, the backend encrypts them server-side using AES-256-GCM before saving them to disk (`backend/data/supabase_vault.enc`).
- **Seamless Fallback**: If Supabase credentials have not been configured yet, the backend automatically uses a local resilient seeded store so that the dashboard remains completely functional.
- **Automated Schema Initialization**: Navigate to **Supabase DB** in the admin sidebar to test your connection and copy the automated SQL script to run in your Supabase SQL Editor.

---

## 4. Default Admin Login Credentials

- **Email**: `admin@accessglobal.io`
- **Password**: `AdminPass123!`

---

## 5. Deployment Guide

### Deploying Frontend to Vercel:
1. In Vercel, import repo `Ikiere/Accessglobal`.
2. Root Directory: `apps/frontend`.
3. Framework: `Vite`. Build: `npm run build`.

### Deploying Admin Dashboard to Vercel:
1. In Vercel, import repo `Ikiere/Accessglobal`.
2. Root Directory: `apps/admin`.
3. Framework: `Vite`. Build: `npm run build`.
4. Set Environment Variable: `VITE_API_BASE_URL` pointing to your deployed backend URL.

### Deploying Backend:
- Can be deployed to Render, Railway, Fly.io, or AWS ECS as a standard Node.js service using:
  - Build command: `npm run build:backend`
  - Start command: `node dist/index.js`
  - Environment variables: `PORT=5000`, `NODE_ENV=production`, `ENCRYPTION_MASTER_KEY=<32-byte-hex>`, `JWT_SECRET=<secret>`.
