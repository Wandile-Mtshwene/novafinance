# NovaFinance — Architecture & Developer Guide

## Overview

NovaFinance is a full-stack accounting, bookkeeping, and financial intelligence SaaS for South African SMEs. It is part of the Nova product suite alongside NovaPOS and NovaPilot, and shares the same design system, auth pattern, and Neon PostgreSQL database.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9, App Router, TypeScript |
| Auth | better-auth v1.6.20 (email/password, drizzle adapter) |
| Database | Drizzle ORM 0.45.2 + Neon PostgreSQL (`@neondatabase/serverless`) |
| UI | TailwindCSS v4, @base-ui/react v1.6.0, shadcn/ui, Lucide icons, Recharts |
| Validation | Zod (`src/lib/validation.ts`) |

## Project Structure

```
src/
  app/
    (auth)/           # Login and signup pages
    (dashboard)/      # Protected dashboard routes
      dashboard/      # All feature pages live here
    api/auth/         # better-auth handler
    globals.css       # Nova design tokens
    layout.tsx        # Root layout with fonts + providers
    page.tsx          # Marketing landing page
  components/
    layout/           # Sidebar, Header, BottomNav
    dashboard/        # StatCard, DashboardOverview
    ui/               # Shared primitives (shadcn + custom)
    {feature}/        # Feature-specific view components
    nova-logo.tsx     # Logo with orange "Finance" highlight
    theme-provider.tsx
  lib/
    auth/             # auth.ts, auth-client.ts, session.ts, permissions.ts
    db/
      schema.ts       # All Drizzle table definitions
      auth-schema.ts  # better-auth tables
      index.ts        # Neon + Drizzle client
      queries/        # Raw Drizzle queries per domain
    {feature}/
      actions.ts      # "use server" Server Actions
    utils.ts          # cn, formatCurrency (ZAR), formatDate, etc.
    validation.ts     # Zod schemas
  middleware.ts       # Cookie-based session guard
```

## Database

All NovaFinance tables use the `fin_` prefix to coexist with NovaPOS (`pos_`) tables in the shared Neon database.

Auth tables use `fin_auth_` prefix.

Variable names in `schema.ts` drop the prefix (e.g., `export const organizations = pgTable("fin_organizations", ...)`).

### Key tables

- `fin_organizations` — one per user (auto-created on signup)
- `fin_users` — linked to better-auth user, holds role
- `fin_chart_of_accounts` — 34 standard accounts seeded on signup (1000–7000)
- `fin_invoices` + `fin_invoice_items` — receivables
- `fin_expenses` + `fin_expense_categories` — payables side
- `fin_payables` — accounts payable / bills
- `fin_transactions` — general ledger entries
- `fin_journal_entries` + `fin_journal_lines` — double-entry accounting
- `fin_budgets` + `fin_budget_lines` — budget management
- `fin_cashflow_forecasts` — monthly cash flow projections
- `fin_tax_records` — SARS/VAT submissions
- `fin_compliance_records` — regulatory checklist items
- `fin_audit_logs` — immutable audit trail
- `fin_settings` — per-org invoice/finance preferences

## Auth & Multi-tenancy

Every request goes through `getOrgSession()` (see `src/lib/auth/session.ts`). This returns `{ user, orgId, session }`. Every query must scope by `organization_id`.

On signup, `databaseHooks` in `auth.ts` automatically:
1. Creates a `fin_organizations` record
2. Creates a `fin_users` record with role `owner`
3. Seeds 34 chart-of-accounts entries

## Role Hierarchy

```
owner (6) > admin (5) > finance_manager (4) > accountant (3) > bookkeeper (2) > viewer (1)
```

Helper functions: `hasRole`, `canManage`, `canPost`, `canApprove`, `canAdmin`, `isOwner`, `canViewReports` — all in `src/lib/auth/permissions.ts`.

## Design System

Orange accent on dark background. CSS custom properties set in `src/app/globals.css`:

```css
--nova-accent: #f59e0b
--nova-accent-secondary: #fdba74
--nova-accent-hover: #ffb84d
--nova-accent-dim: rgba(245, 158, 11, 0.12)
--nova-surface: #1a1e2e   /* page background */
--nova-card: #1e2235      /* card background */
--nova-deep: #141728      /* sidebar background */
```

## Adding a New Feature Page

1. Create `src/lib/db/queries/{feature}.ts` — raw Drizzle queries scoped by `organization_id`
2. Create `src/lib/{feature}/actions.ts` — `"use server"` wrapper calling queries + `revalidatePath`
3. Create `src/components/{feature}/{feature}-view.tsx` — `"use client"` component
4. Create `src/app/(dashboard)/dashboard/{feature}/page.tsx` — Server Component that calls `getOrgSession()` + queries, passes to view
5. Create `src/app/(dashboard)/dashboard/{feature}/loading.tsx` — skeleton

## Environment Variables

```
DATABASE_URL=           # Neon PostgreSQL connection string
BETTER_AUTH_SECRET=     # Random 32+ char secret
BETTER_AUTH_URL=        # e.g. http://localhost:3000
NEXT_PUBLIC_APP_URL=    # e.g. http://localhost:3000
```

## Database Commands

```bash
npm run db:generate    # Generate migration files
npm run db:push        # Push schema to Neon (dev)
npm run db:studio      # Open Drizzle Studio
```

## Running Locally

```bash
cp .env.example .env.local
# Fill in DATABASE_URL and BETTER_AUTH_SECRET
npm install
npm run db:push
npm run dev
```
