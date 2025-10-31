# Service Manifest – GACP Platform

This document lists the eleven canonical services that constitute the final scope of the GACP platform. Use it as the authoritative reference for ownership, integration points, and readiness tracking.

| # | Service | Purpose | Key Capabilities | Status | Next Focus |
| --- | --- | --- | --- | --- | --- |
| 1 | Certification Workflow | Manage end-to-end certification lifecycle. | Intake, document review, scheduling, approvals, certificate issuance, payments. | ✅ Stable | Final QA on inspection scheduling edge cases. |
| 2 | Farm & Cultivation Operations | Support day-to-day farm management. | Farm registry, plot/crop tracking, cultivation cycle logbook, harvest records. | 🟡 In Progress | Close open tasks on digital logbook UX. |
| 3 | Traceability & Verification | Provide seed-to-sale transparency. | QR code verification, audit trails, public certificate portal. | ✅ Stable | Monitor verification latency in prod. |
| 4 | IoT Monitoring & Alerts | Ingest and act on sensor data. | Device normalization, anomaly detection, real-time dashboards, alert routing. | 🟡 In Progress | Normalize THC calibration logs. |
| 5 | AI Decision Support | Data-driven recommendations. | Fertilizer guidance, irrigation scheduling, compliance risk scoring, anomaly detection. | 🟡 In Progress | Complete risk scoring exp-001 and integrate results. |
| 6 | Document Management | Secure document handling. | Magic byte validation, versioning, OCR metadata, tamper detection flags. | ✅ Stable | Automate duplicate detection alerts. |
| 7 | Survey & Self-Assessment | Gather self-evaluation inputs. | Pre-cert questionnaires, readiness scoring, follow-up surveys. | 🟡 In Progress | Publish inspector feedback loop for survey results. |
| 8 | Standards Comparison | Map GACP vs Thai GMP requirements. | Side-by-side requirements, compliance gap analysis, remediation checklists. | 🟡 In Progress | Sync latest regulatory deltas into knowledge base. |
| 9 | Notifications & Engagement | Keep stakeholders informed. | Email/SMS/LINE/Socket.IO alerts, SLA reminders, inspection follow-ups. | ✅ Stable | Localize templates for new provinces. |
| 10 | Analytics & Reporting | Operational intelligence. | Cannabis-first dashboards, inspector KPIs, SLA tracking, exportable reports. | 🟡 In Progress | Align metrics with survey + standards modules. |
| 11 | Security & Governance | Compliance and observability. | RBAC, dual JWT, PDPA data handling, audit logging, monitoring hooks. | ✅ Stable | Expand compliance checklist for new data sources. |

## Guiding Principles

- **Scope Discipline:** Features outside these services are considered out-of-scope for the current finalization push.
- **Documentation:** Updates must be reflected in `docs/research/` (experiments) or `docs/governance/` once the documentation restructure is executed.
- **Python Utilities:** Existing Python scripts under `docs/research/scripts/` remain optional research tooling and are not part of the production surface area.
- **Progress Tracking:** Align sprint boards, OKRs, and release notes with this manifest to avoid scope drift.

## Immediate Actions

1. Map active tickets/OKRs to the service number in this manifest.
2. Audit documentation references to ensure only these services are highlighted.
3. Flag any code or docs that reference deprecated services for removal or archival.
