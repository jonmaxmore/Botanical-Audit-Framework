> **Archived 2025-11-01 — originally located at `docs/research/scripts/README.md`.**

# Research Scripts

Utilities supporting the HDC proof-of-concept live here. Keep each script focused and documented so analysts can rerun experiments without guesswork.

## Available Tools

| Script                            | Purpose                                                                                                           | How to Run                                                                                                                         | Notes                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `hdc_prototype.py`                | Reference implementation of basic hyperdimensional operations (random vectors, binding, bundling, cosine search). | `python archive/research-hdc-2025/scripts/hdc_prototype.py`                                                                        | Prints similarity scores for a toy farm profile query; adapt or import into notebooks.                          |
| `prepare_risk_scoring_dataset.py` | Merge application, inspection, and IoT CSV exports into a single experiment-ready table.                          | `python archive/research-hdc-2025/scripts/prepare_risk_scoring_dataset.py --applications <path> --inspections <path> --iot <path>` | Writes `archive/research-hdc-2025/outputs/risk_scoring_dataset.csv`; skips missing sources with warnings.       |
| `evaluate_metrics.py`             | Compute confusion-matrix stats (F1, precision, recall, FP/FN rates) for prediction CSVs.                          | `python archive/research-hdc-2025/scripts/evaluate_metrics.py --run baseline=baseline.csv --run hdc=hdc.csv`                       | Outputs console summary and `archive/research-hdc-2025/outputs/metrics_summary.csv` (override with `--output`). |

## Contribution Guidelines

1. Prefer pure-Python (or lightweight deps) so scripts run in analysts' environments.
2. Document arguments with `--help` output and update this README whenever a new utility is added.
3. Keep outputs under `archive/research-hdc-2025/outputs/` unless otherwise noted.
4. If a script evolves into production tooling, graduate it to an appropriate package directory and add tests.
