"""Load sklearn joblib pipeline and run barrage detection on IQ chunks."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from lucidrf_inference.constants import DEFAULT_DETECTOR_FEATURE_NAMES, DETECTOR_CHUNK_SIZE
from lucidrf_inference.features import compute_feature_row
from lucidrf_inference.iq import iter_chunks_complex


class BarrageDetector:
    """Wraps the trained `Pipeline([scaler, log_reg])` saved with joblib."""

    def __init__(self, model_path: Path | str):
        self._path = Path(model_path)
        self._pipeline = joblib.load(self._path)
        self._feature_names = self._resolve_feature_names()

    def _resolve_feature_names(self) -> tuple[str, ...]:
        try:
            scaler = self._pipeline.named_steps["scaler"]
            if hasattr(scaler, "feature_names_in_"):
                return tuple(str(x) for x in scaler.feature_names_in_)
        except Exception:
            pass
        return DEFAULT_DETECTOR_FEATURE_NAMES

    def predict_proba_chunks(self, iq: np.ndarray, chunk_size: int = DETECTOR_CHUNK_SIZE) -> tuple[np.ndarray, np.ndarray]:
        """
        Returns (probabilities_positive, chunk_starts) for each full chunk.
        """
        starts, chunks = iter_chunks_complex(iq, chunk_size=chunk_size)
        if chunks.shape[0] == 0:
            return np.zeros(0, dtype=np.float64), starts

        rows = [compute_feature_row(chunks[i], self._feature_names) for i in range(chunks.shape[0])]
        x = pd.DataFrame(rows)[list(self._feature_names)]
        proba = self._pipeline.predict_proba(x)
        # Binary: column 1 = positive (barrage) per sklearn convention
        pos = proba[:, 1] if proba.shape[1] > 1 else proba[:, 0]
        return np.asarray(pos, dtype=np.float64), starts
