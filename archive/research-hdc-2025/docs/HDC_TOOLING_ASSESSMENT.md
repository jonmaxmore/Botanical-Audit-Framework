> **Archived 2025-11-01 — originally located at `docs/research/HDC_TOOLING_ASSESSMENT.md`.**

# HDC Tooling & Infrastructure Assessment

## Prototype Tooling Checklist

| Requirement                          | Recommendation                                                            | Status      | Notes                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| Vector manipulation & binding        | Python + NumPy or PyTorch                                                 | Draft       | `archive/research-hdc-2025/scripts/hdc_prototype.py` committed 2025-11-01                                     |
| Random hypervector generation        | Custom utility or `torch.randint`                                         | Draft       | Included in prototype script; add tests before scaling                                                        |
| Similarity search                    | Cosine similarity via NumPy, `scikit-learn`                               | Draft       | Prototype uses cosine similarity helper; evaluate Faiss for larger corpora                                    |
| Data pipelines                       | Existing ETL scripts (Python)                                             | In progress | `archive/research-hdc-2025/scripts/prepare_risk_scoring_dataset.py` scaffolds aggregates; awaits real exports |
| Experiment tracking                  | Markdown logs (`archive/research-hdc-2025/experiments/`), optional MLflow | Pending     | Decide if MLflow should be enabled                                                                            |
| Metric evaluation & confusion matrix | `archive/research-hdc-2025/scripts/evaluate_metrics.py` helper script     | Draft       | Outputs FP/FN counts and rates for baseline vs. HDC comparisons                                               |
| Visualization                        | Jupyter + matplotlib/seaborn                                              | Pending     | Setup notebook environment                                                                                    |

## Infrastructure Checklist

| Area                | Need                                               | Ownership | Status      |
| ------------------- | -------------------------------------------------- | --------- | ----------- |
| Sandbox environment | Isolated VM / container for experiments            | DevOps    | Pending     |
| Data access         | Read-only access to required Mongo collections     | Data Eng  | In progress |
| Secrets management  | Store DB credentials securely                      | DevOps    | Pending     |
| CI integration      | Optional pre-merge checks for prototype code       | DevOps    | TBD         |
| Monitoring          | Not needed for offline experiments; plan for pilot | N/A       | N/A         |

## Decisions Needed

- Approve Python environment setup (conda or venv standard?).
- Determine if we integrate MLflow/Weights & Biases for experiment tracking.
- Confirm expected integration point with existing analytics services post-PoC.
