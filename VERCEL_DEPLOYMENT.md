# AccessGlobal Monorepo: Vercel Deployment & Setup Guide

This repository is structured as a production-grade monorepo containing two independent, fully featured React applications configured for seamless deployment on [Vercel](https://vercel.com):

1. **`apps/frontend`**: Public enterprise portal with live FX calculator, interactive inquiry modals, and platform feature showcases.
2. **`apps/admin`**: Dedicated operations control console with real-time KPI metrics, interactive SVG analytics charts, tenant management with status toggles, and system security controls.

Both applications use **React 18**, **TypeScript**, and **Vite**, with pre-configured `vercel.json` rules for clean SPA routing (preventing 404 errors on page reloads).

---

## 1. Monorepo Structure

```
Accessglobal/
├── .gitignore
├── package.json               # Root monorepo orchestrator (npm workspaces)
├── VERCEL_DEPLOYMENT.md       # This guide
├── apps/
│   ├── frontend/              # Public Web Portal (Vercel Project 1)
│   │   ├── vercel.json        # SPA rewrite rules
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── src/
│   └── admin/                 # Admin Dashboard (Vercel Project 2)
│       ├── vercel.json        # SPA rewrite rules
│       ├── vite.config.ts
│       ├── package.json
│       └── src/
```

---

## 2. Deploying to Vercel (Step-by-Step)

Because this repository houses both the frontend and admin dashboard in a clean monorepo, you can deploy both as separate, independently scaled projects from the **same GitHub repository** on Vercel.

### Step 2.1: Deploy Project 1 — Frontend Portal

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository: `Ikiere/Accessglobal`.
4. In the **Configure Project** screen:
   - **Project Name**: `accessglobal-frontend` (or your preferred name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `apps/frontend` (⚠️ **Crucial**)
   - Leave the build settings as default:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
5. Click **"Deploy"**.
6. Vercel will install dependencies, compile the frontend, and assign a production URL (e.g. `https://accessglobal-frontend.vercel.app`).

---

### Step 2.2: Deploy Project 2 — Admin Dashboard

1. In your Vercel Dashboard, click **"Add New..."** -> **"Project"**.
2. Select the **same** GitHub repository (`Ikiere/Accessglobal`).
3. In the **Configure Project** screen:
   - **Project Name**: `accessglobal-admin`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `apps/admin` (⚠️ **Crucial**)
   - Leave the build settings as default:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
4. Click **"Deploy"**.
5. Vercel will build the admin console and assign its own production URL (e.g. `https://accessglobal-admin.vercel.app`).

---

## 3. Local Development & Workspaces

You can run, test, and build either app individually or both simultaneously from the root directory:

### Start Development Servers

- Run Frontend only (runs on `http://localhost:3000`):
  ```bash
  npm run dev:frontend
  ```

- Run Admin Dashboard only (runs on `http://localhost:3001`):
  ```bash
  npm run dev:admin
  ```

### Build for Production

- Build Frontend:
  ```bash
  npm run build:frontend
  ```

- Build Admin Dashboard:
  ```bash
  npm run build:admin
  ```

- Build All Apps:
  ```bash
  npm run build
  ```

- Typecheck All Apps:
  ```bash
  npm run typecheck
  ```

---

## 4. SPA Routing Configuration (`vercel.json`)

Both `apps/frontend/vercel.json` and `apps/admin/vercel.json` include pre-configured SPA routing rewrites:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This guarantees that sub-routes, browser refreshes, and deep links never trigger Vercel 404 errors.

---

## 5. Environment Variables (Optional)

If connecting to external backend APIs or Supabase/Firebase in the future, define variables in each project's Vercel Settings -> **Environment Variables**:

- For Frontend: prefix with `VITE_` (e.g., `VITE_API_BASE_URL`)
- For Admin: prefix with `VITE_` (e.g., `VITE_ADMIN_API_KEY`)
