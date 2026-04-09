"""Signal and tensor shape constants aligned with training notebooks."""

# JamShield / detection: feature extraction window (see ml/src/config.py)
DETECTOR_CHUNK_SIZE = 10_000

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
