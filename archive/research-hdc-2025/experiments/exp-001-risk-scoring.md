> **Archived 2025-11-01 — originally located at `docs/research/experiments/exp-001-risk-scoring.md`.**

# Experiment: exp-001-risk-scoring

## Summary

- **Objective:** Evaluate whether HDC improves farm compliance risk scoring versus the current heuristic model.
- **Dataset:** Farm applications (2023-01 to 2025-06), inspection outcomes, associated IoT sensor averages.
- **Baseline:** Current risk heuristic (rule-based) with 0.78 F1-score on labeled set.
- **HDC Variant:** 10k-dim hypervectors per feature; binding for feature interactions; bundling for final farm profile.
- **Status:** Draft

## Setup

- Data prep: export labeled farms, normalize numeric features, encode categorical values.
- Tooling: Python 3.11, NumPy-based HDC prototype (custom module).
- Hyperparameters: DIM=10,000, majority vote cleanup factor=3, cosine similarity threshold=0.2.

## Results

| Metric              | Baseline | HDC | Notes                              |
| ------------------- | -------- | --- | ---------------------------------- |
| F1-score            | 0.78     | TBD |                                    |
| Precision           | 0.81     | TBD |                                    |
| Recall              | 0.74     | TBD |                                    |
| False Positive Rate | TBD      | TBD | Track vs. compliance tolerance     |
| False Negative Rate | TBD      | TBD |                                    |
| False Positives     | TBD      | TBD | Count of farms flagged incorrectly |
| False Negatives     | TBD      | TBD |                                    |
| Inference time (ms) | 35       | TBD |                                    |

## Observations

- Pending initial run.

## Next Steps

- Finalize data extract and preprocessing script.
- Implement HDC prototype notebook.
- Compare metrics and document findings.
