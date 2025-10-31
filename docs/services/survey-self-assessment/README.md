# Survey & Self-Assessment Service

## Overview
Collect readiness inputs from cultivators and inspectors to inform certification planning. Aligns with Service #7 in `docs/SERVICE_MANIFEST.md`. The service ships as a standalone module that authenticates via the shared SSO, then manages questionnaires, responses, and analytics domains end to end.

## Capabilities
- Seven-step survey wizard with multilingual templates (TH/EN).
- Import pipeline for DOCX/XLSX/CSV with auto-mapping support.
- Response analytics grouped by region (North, Northeast, Central, South).
- Versioning and cloning for reusable survey templates.
- Export pathways (CSV, XLSX, PDF) for compliance evidence.

## Components
- `api-survey/` service hosting controllers, models, services, and workers.
- Import subsystem (`services/importParser.js`, `workers/importWorker.js`) for bulk ingest.
- Analytics module (`controllers/analyticsController.js`, `services/analyticsService.js`) powering dashboards.
- Middleware for authentication, validation, and rate limiting.

```text
api-survey/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── workers/
│   ├── routes/
│   └── middleware/
└── tests/ (unit, integration, e2e)
```

## Dependencies
- Analytics & Reporting service for score visualization and KPI rollups.
- Notifications & Engagement service for reminder cadence and follow-up messaging.
- Platform Data Management for consent records, retention policies, and privacy controls.

## SOPs & Runbooks
- **Survey Configuration:** Create or clone templates, assign distribution channels, and publish after QA sign-off.
- **Bulk Import:** Run import jobs via the admin UI, monitor `importWorker` status, and reconcile auto-mapped questions.
- **Response Review:** Triage flagged responses, escalate anomalies to program leads, and capture decisions in analytics notes.
- **Localization:** Validate Thai/English copy during template updates with localization reviewers.

## Migration Notes
- Migrated implementation guidance from `docs/SURVEY_SERVICE_GUIDE.md` (file structure, phased delivery plan).
- Pending follow-up: integrate user-facing walkthroughs from `docs/USER_GUIDE_ADMIN.md` once owners approve archival.
- All subsequent moves must be logged in `docs/research/DOCUMENTATION_LOG.md` with references to approval artifacts.
