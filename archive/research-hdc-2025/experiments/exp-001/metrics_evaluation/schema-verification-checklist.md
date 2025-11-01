> **Archived 2025-11-01 — originally located at `docs/research/experiments/exp-001/metrics_evaluation/schema-verification-checklist.md`.**

# Schema Verification Checklist – `evaluate_metrics.py`

Use this checklist before enabling automation (e.g., `log_metrics_run.py`) to confirm the metrics output schema is stable and complete.

## 1. Input Files

- [ ] Baseline prediction CSV validated (columns: `true_label`, `prediction`).
- [ ] HDC prediction CSV validated (columns: `true_label`, `prediction`).
- [ ] Positive class token confirmed (`--positive` argument aligns with dataset labels).

## 2. Console Output

- [ ] Headers display `Run`, `F1`, `Precision`, `Recall`, `FPR`, `FNR`, `TP`, `FP`, `TN`, `FN`.
- [ ] Values formatted to four decimal places where applicable.
- [ ] No parsing errors or missing lines in the console summary.

## 3. CSV Export (`metrics_summary.csv` or custom `--output`)

- [ ] File written under `archive/research-hdc-2025/outputs/` (or specified path).
- [ ] Columns present: `run`, `total`, `tp`, `fp`, `tn`, `fn`, `precision`, `recall`, `f1`, `false_positive_rate`, `false_negative_rate`.
- [ ] Numeric fields serialised as strings with four decimal places (where expected).
- [ ] Row order matches run order supplied on the command line.

## 4. Consistency Checks

- [ ] Sum of `tp + fp + tn + fn` equals total rows in each prediction CSV.
- [ ] False positive/negative counts match confusion-matrix calculations from notebook/manual checks.
- [ ] Delta calculations in the experiment log template align with exported values.

## 5. Sign-off

- [ ] Schema reviewed by AI/ML lead.
- [ ] Automation owner notified that schema is stable.
- [ ] Checklist archived alongside metrics evaluation logs for traceability.
