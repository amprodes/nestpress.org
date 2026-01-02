# NestPress CMS - Copilot Instructions

## 🚀 Project Overview
- **Stack**: Monorepo with React 19 + Vite (Frontend) and NestJS 10 (Backend).
- **Structure**: Root is frontend, `backend/` is backend. No workspace manager (separate `package.json`s).
- **Ports**: Frontend: `3000`, Backend: `4000` (Set `PORT=4000` in `backend/.env`).
- **API**: REST with JWT auth, prefix `/api/v1`.

## 🛠 Critical Workflows
- **Setup**: `npm install` (root) AND `cd backend && npm install`.
- **Env**: `cp .env.example .env.local` (root) AND `cp backend/.env.example backend/.env`.
- **Run**: Two terminals required.
  - Frontend: `npm run dev` (http://localhost:3000)
  - Backend: `cd backend && npm run start:dev` (http://localhost:4000)
- **Build**: `npm run build` (Frontend), `cd backend && npm run build` (Backend).

## 🏗 Architecture & Patterns
- **State Management**: React Context only (`CMSContext`, `ConfigContext`). No Redux/Zustand.
  - Use `useCMS()` for data/CRUD, `useConfig()` for app settings.
- **Navigation**: Enum-based `ViewState` in `types.ts`. No React Router for admin dashboard.
  - **Add View**: 1. Update `ViewState` enum 2. Add case in `App.tsx` 3. Add nav in `Layout.tsx`.
- **Backend Modules**: NestJS modules in `backend/src/modules/`.
  - Global `JwtAuthGuard`. Use `@Public()` decorator for public endpoints.
  - Multi-DB abstraction via `DatabaseService` (Firebase/Mongo/Dynamo/Supabase).

## 🧩 Key Conventions
- **UI Components**:
  - **Cards**: ALWAYS use `DataCard`, `DataCardHeader`, `DataCardBody` from `components/common/DataCard.tsx`.
  - **Tables**: Use `DataTable` from `components/common/DataTable.tsx` for all listings.
- **API Client**: Use `services/api.ts`. It handles token injection automatically.
- **Themes**: Loaded at runtime from `/themes`. Use `/* @vite-ignore */` for dynamic imports.
- **Plugins**: WordPress-style hooks. Use `doAction` and `applyFilters` from `hooks/nestpress-hooks.ts`.
- **Types**: All shared interfaces are in `types.ts` (Post, Product, Theme, etc.).

## ⚠️ Common Pitfalls
- **CORS**: Ensure `backend/.env` has `CORS_ORIGINS=http://localhost:3000`.
- **Ports**: Backend defaults to 3000 if `PORT` not set. MUST set `PORT=4000` to avoid conflict.
- **Auth**: 401 errors? Check `localStorage.getItem('nestpress_access_token')`.
- **Imports**: Use `@/` alias for root imports.
