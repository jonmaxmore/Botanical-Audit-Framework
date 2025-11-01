"""Archived 2025-11-01 — originally docs/research/scripts/evaluate_metrics.py."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

OUTPUT_DIR = Path("archive/research-hdc-2025/outputs")


@dataclass
class RunResult:
    name: str
    total: int
    tp: int
    fp: int
    tn: int
    fn: int
    precision: float
    recall: float
    f1: float
    fpr: float
    fnr: float

    def to_row(self) -> Dict[str, str]:
        return {
            "run": self.name,
            "total": str(self.total),
            "tp": str(self.tp),
            "fp": str(self.fp),
            "tn": str(self.tn),
            "fn": str(self.fn),
            "precision": f"{self.precision:.4f}",
            "recall": f"{self.recall:.4f}",
            "f1": f"{self.f1:.4f}",
            "false_positive_rate": f"{self.fpr:.4f}",
            "false_negative_rate": f"{self.fnr:.4f}",
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Evaluate confusion-matrix metrics for one or more experiment runs.",
    )
    parser.add_argument(
        "--run",
        action="append",
        metavar="NAME=PATH",
        help="Path to a CSV with columns true_label,prediction (repeat per run).",
    )
    parser.add_argument(
        "--positive",
        default="1",
        help="Value treated as the positive class (default: '1').",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional CSV file to store the aggregated metrics (default: archive outputs).",
    )
    return parser.parse_args()


def parse_run_argument(arg: str) -> Tuple[str, Path]:
    if "=" not in arg:
        raise ValueError("Run argument must be in NAME=PATH format.")
    name, raw_path = arg.split("=", 1)
    if not name:
        raise ValueError("Run name cannot be empty.")
    path = Path(raw_path)
    if not path.exists():
        raise FileNotFoundError(f"Run file not found: {path}")
    return name, path


def normalize_label(value: str, positive_tokens: Iterable[str]) -> bool:
    token = value.strip().lower()
    return token in positive_tokens


def load_predictions(path: Path, positive_value: str) -> List[Tuple[bool, bool]]:
    positive_tokens = {positive_value.lower(), "1", "true", "yes", "positive", "pos"}
    rows: List[Tuple[bool, bool]] = []
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if "true_label" not in reader.fieldnames or "prediction" not in reader.fieldnames:
            raise KeyError("CSV must contain 'true_label' and 'prediction' columns.")
        for row in reader:
            true_val = normalize_label(row["true_label"], positive_tokens)
            pred_val = normalize_label(row["prediction"], positive_tokens)
            rows.append((true_val, pred_val))
    if not rows:
        raise ValueError(f"No rows loaded from {path}")
    return rows


def compute_metrics(name: str, rows: List[Tuple[bool, bool]]) -> RunResult:
    tp = fp = tn = fn = 0
    for true_val, pred_val in rows:
        if true_val and pred_val:
            tp += 1
        elif true_val and not pred_val:
            fn += 1
        elif not true_val and pred_val:
            fp += 1
        else:
            tn += 1
    total = tp + fp + tn + fn
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
    fpr = fp / (fp + tn) if (fp + tn) else 0.0
    fnr = fn / (fn + tp) if (fn + tp) else 0.0
    return RunResult(
        name=name,
        total=total,
        tp=tp,
        fp=fp,
        tn=tn,
        fn=fn,
        precision=precision,
        recall=recall,
        f1=f1,
        fpr=fpr,
        fnr=fnr,
    )


def print_report(results: List[RunResult]) -> None:
    print("Run Summary (positive class metrics)")
    print("=" * 72)
    header = f"{'Run':<15}{'F1':>8}{'Precision':>12}{'Recall':>10}{'FPR':>8}{'FNR':>8}{'TP':>6}{'FP':>6}{'TN':>6}{'FN':>6}"
    print(header)
    print("-" * len(header))
    for result in results:
        print(
            f"{result.name:<15}{result.f1:>8.4f}{result.precision:>12.4f}{result.recall:>10.4f}{result.fpr:>8.4f}{result.fnr:>8.4f}"
            f"{result.tp:>6}{result.fp:>6}{result.tn:>6}{result.fn:>6}"
        )
    print()


def write_output(results: List[RunResult], output_path: Path | None) -> None:
    if output_path is None:
        output_path = OUTPUT_DIR / "metrics_summary.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        fieldnames = [
            "run",
            "total",
            "tp",
            "fp",
            "tn",
            "fn",
            "precision",
            "recall",
            "f1",
            "false_positive_rate",
            "false_negative_rate",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for result in results:
            writer.writerow(result.to_row())
    print(f"[INFO] Metrics written to {output_path}")


def main() -> None:
    args = parse_args()
    if not args.run:
        raise SystemExit("No runs provided. Use --run NAME=PATH for each prediction file.")
    runs: List[RunResult] = []
    for run_arg in args.run:
        name, path = parse_run_argument(run_arg)
        rows = load_predictions(path, args.positive)
        runs.append(compute_metrics(name, rows))
    print_report(runs)
    write_output(runs, args.output)


if __name__ == "__main__":
    main()
