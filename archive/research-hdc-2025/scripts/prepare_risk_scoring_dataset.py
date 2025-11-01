"""Archived 2025-11-01 — originally docs/research/scripts/prepare_risk_scoring_dataset.py."""

from __future__ import annotations

import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean
from typing import DefaultDict, Dict, Iterable, List

OUTPUT_DIR = Path("archive/research-hdc-2025/outputs")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare dataset for HDC risk scoring PoC.")
    parser.add_argument("--applications", type=Path, required=False, help="CSV with farm applications.")
    parser.add_argument("--inspections", type=Path, required=False, help="CSV with inspection outcomes.")
    parser.add_argument("--iot", type=Path, required=False, help="CSV with aggregated IoT metrics.")
    parser.add_argument(
        "--id-field",
        default="farm_id",
        help="Primary identifier column shared across inputs (default: farm_id).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=OUTPUT_DIR / "risk_scoring_dataset.csv",
        help="Destination CSV path.",
    )
    return parser.parse_args()


def load_csv_rows(path: Path) -> List[Dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return [dict(row) for row in reader]


def collapse(values: Iterable[str]) -> str:
    cleaned = [value for value in (v.strip() for v in values) if value]
    if not cleaned:
        return ""
    numeric: List[float] = []
    non_numeric: List[str] = []
    for value in cleaned:
        try:
            numeric.append(float(value))
        except ValueError:
            non_numeric.append(value)
    if numeric and len(numeric) == len(cleaned):
        return f"{mean(numeric):.6f}"
    if non_numeric:
        counts = Counter(non_numeric)
        highest = counts.most_common()
        max_count = highest[0][1]
        candidates = sorted(item for item, count in highest if count == max_count)
        return candidates[0]
    return cleaned[-1]


def accumulate_dataset(
    dataset_name: str,
    rows: List[Dict[str, str]],
    id_field: str,
    accumulator: DefaultDict[str, DefaultDict[str, List[str]]],
) -> None:
    counts: Counter[str] = Counter()
    for row in rows:
        if id_field not in row:
            raise KeyError(f"Missing id field '{id_field}' in dataset '{dataset_name}'.")
        entity_id = row[id_field].strip()
        if not entity_id:
            continue
        counts[entity_id] += 1
        for column, value in row.items():
            if column == id_field:
                continue
            key = f"{dataset_name}__{column}"
            accumulator[entity_id][key].append(value)
    for entity_id, total in counts.items():
        accumulator[entity_id][f"{dataset_name}__records"].append(str(total))


def collect_features(args: argparse.Namespace) -> Dict[str, Dict[str, List[str]]]:
    accumulator: DefaultDict[str, DefaultDict[str, List[str]]] = defaultdict(lambda: defaultdict(list))
    sources = {
        "applications": args.applications,
        "inspections": args.inspections,
        "iot": args.iot,
    }
    for name, path in sources.items():
        if path is None:
            continue
        if not path.exists():
            print(f"[WARN] Skipping missing file: {path}")
            continue
        rows = load_csv_rows(path)
        if not rows:
            print(f"[WARN] No rows loaded from {path}")
            continue
        accumulate_dataset(name, rows, args.id_field, accumulator)
    return accumulator


def write_output(
    accumulator: Dict[str, Dict[str, List[str]]],
    output_path: Path,
    id_field: str,
) -> None:
    if not accumulator:
        print("[WARN] No data aggregated; nothing to write.")
        return
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    feature_names = sorted({feature for columns in accumulator.values() for feature in columns})
    header = [id_field] + feature_names
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=header)
        writer.writeheader()
        for entity_id, columns in sorted(accumulator.items()):
            row = {id_field: entity_id}
            for feature in feature_names:
                row[feature] = collapse(columns.get(feature, []))
            writer.writerow(row)
    print(f"[INFO] Wrote dataset with {len(accumulator)} rows to {output_path}")


def main() -> None:
    args = parse_args()
    accumulator = collect_features(args)
    write_output(accumulator, args.output, args.id_field)


if __name__ == "__main__":
    main()
