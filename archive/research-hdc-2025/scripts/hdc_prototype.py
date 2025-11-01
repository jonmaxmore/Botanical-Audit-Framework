"""Archived 2025-11-01 — originally docs/research/scripts/hdc_prototype.py."""

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Dict, Iterable, List

import numpy as np


DIMENSION = 10_000


def set_seed(seed: int) -> None:
    """Seed both Python's and NumPy's RNGs for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)


def random_hypervector(dimension: int = DIMENSION) -> np.ndarray:
    """Generate a random bipolar hypervector (+1/-1)."""
    return np.random.choice([-1, 1], size=dimension).astype(np.int8)


def bundle(vectors: Iterable[np.ndarray]) -> np.ndarray:
    """Bundle (superpose) vectors via majority vote."""
    vectors = list(vectors)
    if not vectors:
        raise ValueError("Expected at least one vector to bundle.")
    summed = np.sum(vectors, axis=0)
    return np.where(summed >= 0, 1, -1).astype(np.int8)


def bind(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Bind two hypervectors using element-wise multiplication."""
    return np.multiply(a, b).astype(np.int8)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


@dataclass
class HDCDictionary:
    """Simple associative memory using hypervectors."""

    items: Dict[str, np.ndarray]

    def add(self, key: str, vector: np.ndarray) -> None:
        self.items[key] = vector

    def query(self, vector: np.ndarray) -> List[tuple[str, float]]:
        scores = [
            (key, cosine_similarity(vector, stored))
            for key, stored in self.items.items()
        ]
        return sorted(scores, key=lambda x: x[1], reverse=True)


if __name__ == "__main__":
    set_seed(42)

    # Example usage: encode simple key-value pairs.
    keys = {name: random_hypervector() for name in ["crop", "status", "region"]}
    values = {
        "cannabis": random_hypervector(),
        "approved": random_hypervector(),
        "chiang_mai": random_hypervector(),
    }

    farm_profile = bundle(
        [
            bind(keys["crop"], values["cannabis"]),
            bind(keys["status"], values["approved"]),
            bind(keys["region"], values["chiang_mai"]),
        ]
    )

    memory = HDCDictionary(items={})
    memory.add("farm_123", farm_profile)

    query = bundle(
        [
            bind(keys["crop"], values["cannabis"]),
            bind(keys["region"], values["chiang_mai"]),
        ]
    )

    results = memory.query(query)
    for key, score in results:
        print(f"{key}: {score:.4f}")
