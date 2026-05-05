"""Load JSON weights and run barrage detection on IQ chunks using numpy."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from lucidrf_inference.constants import DEFAULT_DETECTOR_FEATURE_NAMES, DETECTOR_CHUNK_SIZE
from lucidrf_inference.features import compute_feature_row
from lucidrf_inference.iq import iter_chunks_complex


def sigmoid(z: np.ndarray) -> np.ndarray:
    """
    The Activation Function.
    Squashes any real number into a probability range between 0.0 and 1.0.
    Formula: 1 / (1 + e^-z)
    """
    return 1 / (1 + np.exp(-z))


class BarrageDetector:
    """logistic regression inference reading from JSON weights."""

    def __init__(self, model_path: Path | str):
        self._path = Path(model_path)
        with open(self._path, "r") as f:
            model_data = json.load(f)
        
        # Retrieve the expected features to ensure we process data in the correct order
        self._feature_names = tuple(model_data.get("feature_names", DEFAULT_DETECTOR_FEATURE_NAMES))
        
        # Load scaler parameters (mean and scale)
        self._mean = np.array(model_data["scaler"]["mean"], dtype=np.float64)
        self._scale = np.array(model_data["scaler"]["scale"], dtype=np.float64)
        

        # Extract the Model Weights
        # _coef is 'w' (weights for each feature)
        # _intercept is 'b' (the bias term)
        self._coef = np.array(model_data["logistic_regression"]["coef"][0], dtype=np.float64)
        self._intercept = np.array(model_data["logistic_regression"]["intercept"][0], dtype=np.float64)

    def predict_proba_chunks(self, iq: np.ndarray, chunk_size: int = DETECTOR_CHUNK_SIZE) -> tuple[np.ndarray, np.ndarray]:
        """
        Returns (probabilities_positive, chunk_starts) for each full chunk.
        """
        starts, chunks = iter_chunks_complex(iq, chunk_size=chunk_size)
        if chunks.shape[0] == 0:
            return np.zeros(0, dtype=np.float64), starts

        # Compute features per chunk
        rows = [compute_feature_row(chunks[i], self._feature_names) for i in range(chunks.shape[0])]
        
        # Assemble the extracted features into a 2D matrix (X)
        # Rows = individual chunks, Columns = specific features
        x_data = []
        for row in rows:
            x_data.append([row[name] for name in self._feature_names])
            
        x = np.array(x_data, dtype=np.float64)
        
        # Normalize the live features using the training distribution (Z-score normalization)
        x_scaled = (x - self._mean) / self._scale
        
        # Calculate Z = w^T * X + b
        # We use np.dot to multiply the scaled features by their respective weights
        z = np.dot(x_scaled, self._coef) + self._intercept
        
        # Pass the raw Z scores through the sigmoid curve to get final probabilities
        pos = sigmoid(z)
        
        return np.asarray(pos, dtype=np.float64), starts
