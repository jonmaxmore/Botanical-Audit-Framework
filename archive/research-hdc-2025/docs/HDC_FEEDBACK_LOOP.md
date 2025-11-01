> **Archived 2025-11-01 — originally located at `docs/research/HDC_FEEDBACK_LOOP.md`.**

# HDC Stakeholder Feedback Loop

| Stage                     | Stakeholders                                 | Expected Input/Output                                           | Cadence                |
| ------------------------- | -------------------------------------------- | --------------------------------------------------------------- | ---------------------- |
| **Use-Case Validation**   | Product Lead, Compliance Ops, Inspector reps | Confirm pain point, prioritize KPI, approve PoC scope.          | One-off (kickoff)      |
| **Data Readiness Review** | Data Engineering, AI/ML Lead, Compliance     | Validate extracts, ensure PDPA compliance, highlight gaps.      | Before each experiment |
| **Experiment Review**     | AI/ML Lead, Domain Expert, Product           | Present results, discuss anomalies, decide next iteration.      | Bi-weekly during PoC   |
| **Adoption Decision**     | Exec Sponsor, Compliance, Engineering        | Go/No-Go for integration, resourcing, timeline.                 | At conclusion of PoC   |
| **Pilot Retrospective**   | Operations, Support, Product, Engineering    | Gather feedback from pilot rollout, monitor production metrics. | After pilot completion |

## Communication Checklist

- Meeting notes stored in `archive/research-hdc-2025/meetings/` (create per session).
- Update experiment status in `archive/research-hdc-2025/experiments/` after each review.
- Notify Compliance for any data export requests or new model deployment.
