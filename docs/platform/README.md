# Platform Documentation

The platform section houses cross-cutting practices shared across all eleven services. Use the subfolders below to locate the right reference during migration:

- `infrastructure/` — Hosting topology, network zoning, and environment responsibilities.
- `data/` — Canonical datasets, schema governance, and retention policies.
- `security/` — Authentication, authorization, and compliance guardrails.
- `operations/` — Runbooks, deployment workflows, and incident response.
- `tooling/` — Shared developer tooling, automation, and productivity aids.

## Migration Guidance
- Move existing documents into the appropriate subfolder while logging the action in `docs/research/DOCUMENTATION_LOG.md`.
- Capture approvals in `docs/governance/archive-validation.md` before archiving or deleting any legacy content.
- Update inter-document links after each migration to prevent broken references in READMEs, runbooks, or checklists.
# Platform Documentation

Cross-cutting guidance that supports every service in the GACP platform lives here. Organize platform topics by domain so teams can find shared standards quickly.

## Sections
- `infrastructure/` — Environment topology, provisioning runbooks, and IaC references.
- `data/` — Data contracts, schemas, retention policies, and lineage.
- `security/` — Authentication, authorization, and compliance controls.
- `operations/` — Deployment workflows, observability, SRE practices, and runbooks.
- `tooling/` — Developer tooling, automation, and productivity aids.

## Migration Tips
- Migrate content from legacy folders one topic at a time and link back to approval records.
- Note any environment pre-requisites that cross-reference the eleven services.
- Flag deprecated guidance for archival review using `governance/archive-validation.md`.
