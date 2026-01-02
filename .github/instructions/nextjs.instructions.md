---
applyTo: '**'
---

# Next.js Best Practices for LLMs (2025)

_Last updated: July 2025_

This document summarizes the latest, authoritative best practices for building, structuring, and maintaining Next.js applications.

## 1. Project Structure & Organization

- **Use the `app/` directory** (App Router) for all new projects. Prefer it over the legacy `pages/` directory.
- **Top-level folders:**
  - `app/` — Routing, layouts, pages, and route handlers
  - `public/` — Static assets (images, fonts, etc.)
  - `lib/` — Shared utilities, API clients, and logic
  - `components/` — Reusable UI components
  - `contexts/` — React context providers
  - `styles/` — Global and modular stylesheets
  - `hooks/` — Custom React hooks
  - `types/` — TypeScript type definitions

## 2. Component Best Practices

- **Component Types:**
  - **Server Components** (default): For data fetching, heavy logic, and non-interactive UI.
  - **Client Components:** Add `'use client'` at the top. Use for interactivity, state, or browser APIs.
- **Naming Conventions:**
  - Use `PascalCase` for component files and exports
  - Use `camelCase` for hooks
  - Use `snake_case` or `kebab-case` for static assets

## 3. API Routes (Route Handlers)

- **Location:** Place API routes in `app/api/`
- **HTTP Methods:** Export async functions named after HTTP verbs (`GET`, `POST`, etc.)
- **Validation:** Always validate and sanitize input
- **Error Handling:** Return appropriate HTTP status codes

## 4. General Best Practices

- **TypeScript:** Use TypeScript for all code. Enable `strict` mode
- **ESLint & Prettier:** Enforce code style and linting
- **Environment Variables:** Store secrets in `.env.local`
- **Performance:** Use built-in Image and Font optimization
- **Security:** Sanitize all user input, use HTTPS

# Avoid Unnecessary Example Files

Do not create example/demo files unless the user specifically requests them. Keep the repository clean and production-focused.
