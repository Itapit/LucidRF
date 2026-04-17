from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class DetectionResult:
    """Per-chunk barrage detection aligned with sklearn `predict_proba` (positive class = barrage)."""

    probabilities: np.ndarray  # shape (n_chunks,), P(class=1)
    chunk_starts: np.ndarray  # sample index where each chunk starts in the original IQ


@dataclass(frozen=True)
class DenoiseResult:
    """Denoised I/Q as float32 (2, N): I and Q rows, N = number of complex samples processed."""

    denoised_iq: np.ndarray  # shape (2, N); overlap path uses N = input length
