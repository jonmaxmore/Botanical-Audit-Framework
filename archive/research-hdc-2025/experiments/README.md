> **Archived 2025-11-01 — originally located at `docs/research/experiments/README.md`.**

# HDC Experiment Logs

Use this folder to document all hyperdimensional computing experiments. Create one Markdown file per experiment using the template below. Data prep helpers live in `../scripts/` (e.g., `prepare_risk_scoring_dataset.py`), and metric evaluation runs through `evaluate_metrics.py`.

Before enabling automation or updating logging scripts, quickly review `exp-001/metrics_evaluation/schema-verification-checklist.md`. It outlines the required columns, formatting, and sanity checks so everyone confirms the metric schema is stable prior to wiring in new tooling.

## Template

```markdown
# Experiment: <name>

## Summary

- **Objective:**
- **Dataset:**
- **Baseline:**
- **HDC Variant:**
- **Status:** Draft / In-Progress / Complete

## Setup

- Data preparation steps
- Libraries / tooling
- Hyperparameters

## Results

| Metric | Baseline | HDC | Notes |
| ------ | -------- | --- | ----- |

## Observations

- Key findings
- Errors / anomalies

## Next Steps

- Iterations required
- Decisions / approvals needed
```
