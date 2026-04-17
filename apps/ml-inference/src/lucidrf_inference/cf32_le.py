"""
Load complex float32 little-endian IQ from raw binary.

Layout (GNU Radio / common SDR "cf32" on little-endian hosts):
  For each sample: 4 bytes I (float32 LE) + 4 bytes Q (float32 LE), repeated.
  NumPy dtype ``<c8`` matches this byte layout.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

_DTYPE = np.dtype("<c8")  # complex64, little-endian component order
_SAMPLE_BYTES = 8


def cf32_le_from_bytes(data: bytes | bytearray | memoryview, *, offset: int = 0) -> np.ndarray:
    """
    Parse raw bytes into a 1D complex64 array.

    ``offset`` skips a fixed header; remaining length must be a multiple of 8 bytes
    (or trailing bytes are dropped with a clear error — we raise if partial sample).
    """
    if offset < 0:
        raise ValueError("offset must be >= 0")
    buf = memoryview(data)[offset:]
    n = len(buf)
    if n == 0:
        return np.zeros(0, dtype=np.complex64)
    if n % _SAMPLE_BYTES != 0:
        raise ValueError(
            f"Byte length after offset ({n}) is not a multiple of {_SAMPLE_BYTES} "
            "(each cf32_le sample is 8 bytes: float32 I + float32 Q, LE)."
        )
    return np.frombuffer(buf, dtype=_DTYPE, count=n // _SAMPLE_BYTES).copy()


def cf32_le_from_file(path: Path | str, *, offset: int = 0) -> np.ndarray:
    """Read an entire file (or from ``offset`` to EOF) as cf32_le IQ."""
    p = Path(path)
    raw = p.read_bytes()
    return cf32_le_from_bytes(raw, offset=offset)
