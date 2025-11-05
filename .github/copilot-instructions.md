# Botanical Audit Framework Agent Guide
## System Snapshot
- Monorepo managed with `pnpm` + `turbo`; install once at root (`pnpm install`) and work with workspace packages in `apps/*` and `packages/*`.
- Primary services live in `apps/backend` (Express 5) and three Next.js portals: `apps/farmer-portal`, `apps/admin-portal`, `apps/certificate-portal`; `apps/frontend` is legacy reference-only.
- Shared TypeScript utilities/components reside under `packages/` (`constants`, `types`, `ui`, `utils`) and backends use `apps/backend/shared` for auth, logging, and response helpers.
- Reference `docs/ARCHITECTURE.md` and `config/services-catalog.js` for service boundaries, ownership, and status before touching module code.

## Backend API
- Default production entry is `apps/backend/atlas-server.js` (MongoDB Atlas, Redis, health monitoring); `dev-server.js` offers a mock DB mode on port 3004 for quick integration tests.
- Backend is module-driven: each feature folder in `apps/backend/modules/*` exposes `index.js` factory functions, routes, controllers, and domain logic; register new endpoints through module routers instead of editing `routes/` directly.
- Business workflows run through `modules/application-workflow/domain/gacp-workflow-engine.js`; reuse its state transitions (`workflowEngine` methods) rather than duplicating status logic.
- Global dependencies (Mongo manager, secrets manager, health monitoring, notification bus) are wired in `config/` and `shared/`; import from there to stay consistent with logging, error shapes, JWT parsing.

## Frontend Portals
- Each portal has its own port (`3001` farmer, `3002` admin, `3003` public certificate) and expects the backend available at `http://localhost:3005` (`atlas-server`) or proxy to the dev mock.
- Follow the role-first navigation pattern: dashboards live under `app/dashboard/<role>` with shared layout components in `components/dashboard`; respect the cannabis-first ordering when adding menu items or analytics.
 - Shared React code uses workspace aliases (`@gacp/constants`, `@gacp/ui`, etc.); export new shared components from `packages/ui/src/index.ts` so all portals can consume them.
- Storybook is wired for farmer portal (`pnpm --filter @gacp/farmer-portal storybook`) and doubles as the reference for design tokens defined in `packages/config/tailwind`.

## Workflows & Commands
- Install: `pnpm install`; bootstrap envs via `.env.example` files inside each app (`apps/backend/.env.example`, `apps/farmer-portal/.env.example`, ...).
- Backend dev: `pnpm --filter gacp-backend dev` (nodemon on Atlas server) or `node apps/backend/dev-server.js` for mock mode; lint via `pnpm --filter gacp-backend lint`.
- Frontend dev: `pnpm --filter @gacp/farmer-portal dev` (repeat for admin/certificate); run all portals concurrently with `pnpm turbo run dev --filter ...`.
- Repo-wide quality gates (run before commits): `npm run type-check`, `npm run lint:all`, `npm run test`, optional `npm run test:e2e` for Playwright.

## Testing & QA
- Jest configs live per app (`apps/backend/jest.config.js`, `apps/*/jest.config.js`); create tests beside sources or in `__tests__` folders to integrate with existing coverage reports in `TESTING_REPORT.md`.
- Backend smoke tests are scripted (`apps/backend/test-smoke.js`, root `run-smoke-test.ps1`); use them before deployment changes.
- Playwright E2E targets the certificate portal; use `pnpm --filter @gacp/certificate-portal test:e2e` and open reports with `pnpm --filter @gacp/certificate-portal test:e2e:report`.
- Load testing harness resides in `load-tests/` with Artillery; configs expect the Atlas server endpoint list from `/health` to confirm readiness.

## Conventions & Gotchas
- Always consult `docs/EXISTING_MODULES_INVENTORY.md` and `config/services-catalog.js` to avoid duplicating implemented modules and to understand ownership.
- Preserve audit logging via `shared/logger` and `modules/*/infrastructure/audit` helpers; new business flows must feed the unified audit trail used by inspectors.
- Notification flows rely on Bull queues and Socket.IO inside `modules/notification-service`; reuse queue names and events listed in `modules/notification/README.md` when emitting updates.
- Cannabis is the primary crop: ensure UI ordering, seed data (`apps/backend/data/cannabis`) and analytics defaults keep cannabis first, with other medicinal plants following the documented order.
