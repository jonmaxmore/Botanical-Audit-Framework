# Farm & Cultivation Operations Service

## Overview
Support daily farm operations including crop planning, cultivation tracking, and harvest logging. Aligns with Service #2 in `docs/SERVICE_MANIFEST.md`.

## Capabilities
- Farm and plot registry management
- Cultivation cycle logging with SOP checkpoints
- Harvest reporting and compliance tagging

## Components
- Farmer portal cultivation module
- Mobile or offline data capture interfaces
- Data sync pipelines into analytics

## Dependencies
- AI Decision Support service for agronomic recommendations
- Traceability & Verification service for harvest provenance
- Document Management service for compliance attachments

## SOPs & Runbooks
- Cultivation log entry workflow
- Harvest sign-off checklist
- Exception handling for missing data

## Migration Notes
- Candidate sources: `docs/GACP_CANNABIS_FARM_MANAGEMENT_DESIGN.md`, `docs/guides/*farm*`, `docs/MAIN_SERVICES_CATALOG.md`.
- Confirm farmer portal UX guides before archiving older walkthroughs.
- Record migrations and approvals in the documentation log.
