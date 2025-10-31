# Standards Comparison Service

## Overview
Map GACP requirements against Thai GMP and other regulatory frameworks to surface compliance gaps. Aligns with Service #8 in `docs/SERVICE_MANIFEST.md`. The service curates a modular knowledge base that supports national-scale compliance while remaining microservices-ready for future expansion.

## Capabilities
- Eight-standard comparison matrix (GACP, GAP, Organic, EU-GMP, USP, WHO-GMP, ISO 22000, HACCP).
- Gap analysis with remediation planning and cost estimation.
- Requirements mapping with version-controlled updates for new regulations.
- Compliance roadmap export for stakeholder alignment.
- Localization-ready content for Thai government publication standards.

## Components
- Standards repository with modular schema per framework.
- Comparison engine implementing bounded contexts per standard (per DDD guidance).
- Presentation layer delivering visualization dashboards and roadmap builders.
- Shared infrastructure hooks: logging, monitoring, cache, and queue integration as described in the national architecture blueprint.

## Dependencies
- Document Management service for storing regulatory documents, templates, and audit evidence.
- Analytics & Reporting service for surfacing compliance KPIs and roadmap progress.
- Security & Governance service for audit logging, PDPA alignment, and access policy enforcement.

## SOPs & Runbooks
- **Regulatory Intake:** Capture new or updated standards, validate metadata, and stage drafts for legal review before publishing to production.
- **Gap Analysis Review:** Run comparison reports, prioritize remediation items with program owners, and log approvals.
- **Publication Workflow:** Generate stakeholder-ready outputs (PDF/Excel) and ensure translation/localization sign-off.

## Migration Notes
- Migrated architectural rationale, compliance checklists, and module overview from `docs/SUSTAINABLE_NATIONAL_STANDARD_ARCHITECTURE.md`.
- Pending action: migrate roadmap and migration-phase details after legal/compliance owners confirm archival of the source document.
- Document every additional move in `docs/research/DOCUMENTATION_LOG.md` and attach approval references.
