> **Archived 2025-11-01 — originally located at `docs/research/HDC_USE_CASE_SHORTLIST.md`.**

# Hyperdimensional Computing Use-Case Shortlist

| Candidate                                   | Description                                                                                                                         | Value Proposition                                                               | Data Sources                                                                             | Current Pain Points                                                                    | Est. Feasibility                                                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Farm Compliance Risk Scoring**            | Generate a dynamic risk score for each farm application based on documents, inspection history, IoT readings, and officer comments. | Prioritize inspections, reduce manual triage, early warning for non-compliance. | `applications`, `inspections`, IoT sensor collections, officer notes, document metadata. | Manual scoring varies by officer; slow turnaround; inconsistent follow-up.             | **High** – Rich data, clear metrics, aligns with risk frameworks.                                            |
| **Inspection Scheduling Optimization**      | Recommend optimal inspection schedule considering risk, geography, inspector availability, and backlog.                             | Reduce travel cost, balance workload, improve SLA compliance.                   | Inspection queue, risk score, inspector roster, GIS data.                                | Scheduling handled manually; limited visibility into conflicts; SLA misses.            | **Medium** – Requires integration with scheduling tools; needs reliable availability data.                   |
| **Document Authenticity Anomaly Detection** | Detect tampered or inconsistent documents (PDFs, images) across submissions.                                                        | Prevent fraud, reduce audit effort on forged documents.                         | File metadata, checksum logs, submission history, text extraction.                       | Investigators manually cross-check; forensics expertise limited; high false negatives. | **Medium** – HDC promising for high-dimensional feature representations but requires preprocessing pipeline. |

## Selection Guidance

1. **Primary KPI Impact:** Choose the use case with the strongest link to regulatory outcomes (risk scoring likely).
2. **Data Readiness:** Verify data completeness and labeling; risk scoring already has historical decisions.
3. **Stakeholder Priority:** Confirm with Compliance & Operations leads.
4. **Pilot Scope:** Start with one province/inspector group to collect rapid feedback.

Once the target use case is approved, execute the feasibility plan tasks accordingly.
