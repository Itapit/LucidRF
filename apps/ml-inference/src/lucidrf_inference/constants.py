"""Signal and tensor shape constants aligned with training notebooks."""

from __future__ import annotations

import json
from pathlib import Path

# JamShield / detection: feature extraction window (see ml/src/config.py)
DETECTOR_CHUNK_SIZE = 10_000

_U_NET_SCALING_JSON = Path(__file__).resolve().parent / "u_net_scaling.json"


def load_u_net_global_scale() -> float:
    """Load training global max (divide IQ by this before U-Net forward)."""
    with open(_U_NET_SCALING_JSON, encoding="utf-8") as f:
        data = json.load(f)
    return float(data["global_max"])


U_NET_GLOBAL_SCALE = load_u_net_global_scale()

# MIT RF Challenge / U-Net training
U_NET_INPUT_LENGTH = 40_960
# Stride between U-Net windows (50% overlap).
U_NET_HOP_SAMPLES = U_NET_INPUT_LENGTH // 2
MIT_SAMPLE_RATE_HZ = 25e6

# Default feature names used when training CSVs (ml notebooks)
DEFAULT_DETECTOR_FEATURE_NAMES = (
    "Mean Power",
    "PAPR",
    "Kurtosis",
    "Skewness",
    "Spectral Flatness",
)
