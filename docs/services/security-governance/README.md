# Security & Governance Service

## Overview
Establish platform-wide security controls, compliance policies, and monitoring capabilities. Aligns with Service #11 in `docs/SERVICE_MANIFEST.md`.

## Capabilities
- Role-based access control and dual JWT flows
- PDPA-aligned data handling and audit logging
- Compliance checklists and monitoring hooks

## Components
- Identity providers and access gateways
- Audit logging infrastructure
- Compliance automation scripts

## Dependencies
- Platform Security documentation for shared controls
- Certification Workflow service for authorization policies
- Document Management service for retention enforcement

## SOPs & Runbooks
- Access request and approval process
- Compliance evidence collection
- Monitoring and escalation workflows

## Migration Notes
- Candidate sources: `docs/compliance/*`, `docs/SECURITY` notes, governance meeting summaries.
- Validate audit requirements before archiving original materials.
- Record migration steps in the documentation log.
