> **Archived 2025-11-01 — originally located at `docs/research/HDC_RISK_REGISTER.md`.**

# HDC PoC Risk Register

| ID  | Risk                                              | Impact | Likelihood | Mitigation                                                                     | Owner                 | Status     |
| --- | ------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------ | --------------------- | ---------- |
| R1  | Insufficient labeled data for training/validation | High   | Medium     | Augment with historical decisions; involve domain experts for labeling sprint. | Data Eng / Compliance | Mitigating |
| R2  | PDPA compliance breach due to data exports        | High   | Low        | Use anonymized IDs; secure sandbox; obtain approvals before export.            | Compliance            | Open       |
| R3  | HDC model underperforms baseline                  | Medium | Medium     | Iterate with feature engineering; fallback to hybrid ML approach.              | AI/ML                 | Open       |
| R4  | Tooling/setup delays (sandbox, libs)              | Medium | Medium     | Schedule DevOps support early; prepare local dev fallback.                     | DevOps                | Open       |
| R5  | Lack of stakeholder alignment on metrics          | Medium | Low        | Keep meeting cadence; document KPIs in feasibility plan.                       | Product               | Monitoring |
| R6  | Integration complexity post-PoC                   | Medium | Medium     | Plan integration blueprint early; involve backend team in design.              | Engineering           | Open       |
