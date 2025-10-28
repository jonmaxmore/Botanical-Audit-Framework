# GACP Platform

Enterprise platform for managing Good Agricultural and Collection Practices (GACP) certification and smart farming operations for cannabis and six priority medicinal plants in Thailand.

## Overview

The system delivers an end-to-end workflow for growers, inspectors, and regulators:

- Farmers submit and track certification applications, manage farms, and monitor sensor data.
- DTAM officers review documents, schedule inspections, and issue certificates.
- Approvers finalize decisions with full audit trails and traceability.
- AI services provide fertilizer and irrigation guidance, with cannabis presented as the default crop option across the experience.

## Core Capabilities

- **Certification Management** – Digital applications, document handling, multi-stage workflow, payment capture, and certificate issuance.
- **Operations & Traceability** – Farm registry, crop lifecycle tracking, QR/traceability endpoints, audit logs, and seed-to-sale visibility.
- **IoT Telemetry** – Sensor ingestion (soil, water, climate), alerting, and dashboards for real-time farm monitoring.
- **AI & Analytics** – Fertilizer recommendation engine, irrigation modeling, compliance insights, and regional knowledge base.
- **Security & Compliance** – Role-based access, JWT authentication, rate limiting, encryption at rest/in transit, health monitoring, and observability.

## Architecture Snapshot

```
apps/
  backend/    # Express API, MongoDB/Redis integrations, socket service, modular domain layers
  frontend/   # Next.js portal for farmers, inspectors, approvers, admin
packages/     # Shared libraries and tooling
docs/         # Architecture, workflows, deployment, research
scripts/      # Tooling, automation, quality checks
```

**Backend**: Node.js 18+, Express 5, MongoDB Atlas, Redis, Socket.IO, Mongoose, PM2  
**Frontend**: Next.js 16, React 19, TypeScript, MUI, React Query, Tailwind, Notistack  
**DevOps**: PNPM workspaces, Husky + lint-staged, Jest, Playwright, Artillery, Terraform references, PM2/docker deployment

## Deployment Readiness

- Production server bootstrap in `apps/backend/server.js` and `atlas-server.js` with security middleware, health routes, graceful shutdown, and Redis-enabled Socket.IO.
- PM2 ecosystem definitions, PowerShell helpers, and Docker assets for local/production rollouts.
- Comprehensive deployment, infra, and ops documentation under `docs/05_DEPLOYMENT` and `docs/deployment`.
- Observability stack foundations: structured logging (Winston), metrics, request tracking, rate limiting, and health dashboards.

## Current Roadmap

| Phase   | Focus                              | Status                                                         |
| ------- | ---------------------------------- | -------------------------------------------------------------- |
| Phase 1 | Certification workflow & portals   | Delivered – undergoing refinement for production rollout       |
| Phase 2 | IoT integration & farm operations  | Delivered – tuning telemetry and alert services                |
| Phase 3 | AI recommendations & analytics     | In progress – fertilizer engine live, irrigation & NLP ongoing |
| Phase 4 | National expansion & reporting     | Planned – mobile inspector tools, government integrations      |
| Phase 5 | Advanced automation & supply chain | Planned – remote sensing, marketplace, cooperative services    |

All enhancements must assess existing modules first: refactor or harden the current implementation before introducing net-new components.

## Getting Started

1. Install dependencies with `pnpm install`.
2. Configure environment variables (`.env.example`, `apps/backend/.env`).
3. Run backend: `pnpm --filter @gacp/backend dev` or `pnpm exec pm2 start ecosystem.config.js`.
4. Run frontend: `pnpm --filter frontend dev`.
5. Execute quality gates before every merge: `pnpm run format:check`, `pnpm run lint:all`, `pnpm exec tsc --noEmit`, `pnpm run test`.

Refer to:

- `docs/DEV_ENVIRONMENT_QUICK_START.md` for local setup.
- `docs/ARCHITECTURE.md` for service decomposition and data flows.
- `docs/COMPETITIVE_ANALYSIS.md` and `docs/COMPREHENSIVE_DEVELOPMENT_PLAN.md` for ongoing roadmap context.

## Quality, Security & Operations

- Enforce Husky pre-commit hooks and linting/type rules across all workspaces.
- Maintain updated disaster recovery, backup, and runbook procedures (`docs/deployment/**`).
- Document significant design decisions via ADRs or change logs placed in `docs/`.
- Archive superseded manuals or specs under `archive/` with versioned filenames to avoid duplication.

## License

Proprietary software – all rights reserved. Internal use only.
