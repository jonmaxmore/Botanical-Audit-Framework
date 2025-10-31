# Certification Workflow Service

## Overview
Manage the full certification lifecycle for cultivators, inspectors, and administrators. Aligns with Service #1 in `docs/SERVICE_MANIFEST.md`.

## Capabilities
- Application intake and eligibility screening
- Document review with configurable checklists
- Inspection scheduling, approvals, and certificate issuance
- Integrated payment confirmation and audit trails

## Components
- Admin portal certification module
- Workflow engine integrations
- Notification triggers tied to status changes

## Dependencies
- Document Management service for uploads and validation
- Notifications & Engagement service for multi-channel updates
- Security & Governance service for authorization and audit logging

## SOPs & Runbooks
- Certification case creation
- Pre-inspection checklist execution
- Certificate issuance and revocation procedures

## Migration Notes
- Candidate sources: `docs/07_USER_GUIDES`, `docs/SYSTEM_OVERVIEW.md`, `docs/MAIN_SERVICES_CATALOG.md`.
- Pending owner confirmation before archiving legacy certification walkthroughs.
- Log each migrated artifact in `docs/research/DOCUMENTATION_LOG.md`.
