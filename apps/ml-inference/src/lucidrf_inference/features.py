"""Hand-crafted RF features for barrage detection (matches ml/src/features.py)."""

from __future__ import annotations

import numpy as np
import scipy.stats as stats


def _calc_mean_power(_chunk: np.ndarray, mag: np.ndarray, power: np.ndarray) -> float:
    return float(np.mean(power))


def _calc_papr(_chunk: np.ndarray, mag: np.ndarray, power: np.ndarray) -> float:
    peak = float(np.max(power))
    avg = float(np.mean(power))
    if avg <= 0:
        return 0.0
    return float(10 * np.log10(peak / avg))


def _calc_kurtosis(_chunk: np.ndarray, mag: np.ndarray, _power: np.ndarray) -> float:
    return float(stats.kurtosis(mag))


def _calc_skewness(_chunk: np.ndarray, mag: np.ndarray, _power: np.ndarray) -> float:
    return float(stats.skew(mag))


def _calc_spectral_flatness(chunk: np.ndarray, _mag: np.ndarray, _power: np.ndarray) -> float:
    spectrum = np.abs(np.fft.fft(chunk)) ** 2
    spectrum = spectrum[spectrum > 0]
    if len(spectrum) == 0:
        return 0.0
    gmean = stats.gmean(spectrum)
    amean = float(np.mean(spectrum))
    if amean <= 0:
        return 0.0
    return float(gmean / amean)


_FEATURE_FUNCS = {
    "Mean Power": _calc_mean_power,
    "PAPR": _calc_papr,
    "Kurtosis": _calc_kurtosis,
    "Skewness": _calc_skewness,
    "Spectral Flatness": _calc_spectral_flatness,
}


def compute_feature_row(chunk: np.ndarray, feature_names: tuple[str, ...]) -> dict[str, float]:
    """Compute a single row of features for one complex IQ chunk."""
    mag = np.abs(chunk)
    power = mag**2
    row: dict[str, float] = {}
    for name in feature_names:
        fn = _FEATURE_FUNCS.get(name)
        if fn is None:
            raise ValueError(f"Unknown feature name: {name!r}")
        row[name] = fn(chunk, mag, power)
    return row
