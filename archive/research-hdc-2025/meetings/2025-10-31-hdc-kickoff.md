> **Archived 2025-11-01 — originally located at `docs/research/meetings/2025-10-31-hdc-kickoff.md`.**

# Meeting Notes: HDC PoC Kickoff

- **Date:** 2025-10-31
- **Attendees:** Product Lead, Compliance Ops, AI/ML Lead, Data Engineering, Operations

## Agenda

1. Review HDC feasibility plan & use-case shortlist.
2. Confirm primary PoC objective and success metrics.
3. Identify data readiness tasks and owners.
4. Align on timeline and next checkpoints.

## Decisions

- **Primary Use Case:** Farm compliance risk scoring selected for PoC.
- **Success Metrics:** Improve F1-score to ≥0.82, maintain precision ≥0.80, inference latency ≤40ms, document false-positive/false-negative deltas.
- **Timeline:** Data prep (1 week), prototyping (2 weeks), review meeting bi-weekly.

## Action Items

| Owner            | Task                                                | Due        |
| ---------------- | --------------------------------------------------- | ---------- |
| Data Engineering | Deliver labeled dataset export with IoT aggregates. | 2025-11-05 |
| AI/ML Lead       | Build initial HDC prototype notebook (exp-001).     | 2025-11-12 |
| Compliance Ops   | Validate PDPA compliance for data extracts.         | 2025-11-04 |
| Product Lead     | Schedule next review meeting (mid-PoC).             | 2025-11-07 |

## Follow-Ups

- AI/ML to align false positive/negative tracking with Analytics before first experiment run.

## Notes

- Need clarification on missing geo coordinates → follow up with field inspectors.
- Investigate availability of THC sensor calibration logs for IoT normalization.
