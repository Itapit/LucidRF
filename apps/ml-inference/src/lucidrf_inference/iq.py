"""Chunking and layout helpers for complex baseband I/Q."""

from __future__ import annotations

import numpy as np

from lucidrf_inference.constants import DETECTOR_CHUNK_SIZE, U_NET_INPUT_LENGTH


def remove_dc_offset(iq: np.ndarray) -> np.ndarray:
    """Remove complex DC: subtract mean of I and Q (same as subtracting complex mean per sample)."""
    x = np.asarray(iq).ravel()
    if x.size == 0:
        return x.astype(np.complex64, copy=False)
    if x.dtype not in (np.complex64, np.complex128):
        x = x.astype(np.complex128)
    m = np.mean(x)
    out = x - m
    return out.astype(np.complex64, copy=False)


def pad_iq_to_length(iq: np.ndarray, target_len: int) -> np.ndarray:
    """Right-pad or truncate complex IQ to exactly `target_len` samples."""
    iq = np.asarray(iq).ravel()
    if target_len <= 0:
        return np.zeros(0, dtype=np.complex64)
    if iq.size >= target_len:
        return iq[:target_len].astype(np.complex64, copy=False)
    out = np.zeros(target_len, dtype=np.complex64)
    out[: iq.size] = iq.astype(np.complex64, copy=False)
    return out


def iter_chunks_complex(iq: np.ndarray, chunk_size: int = DETECTOR_CHUNK_SIZE) -> tuple[np.ndarray, np.ndarray]:
    """
    Yields non-overlapping chunks from 1D complex IQ.

    Returns (chunk_starts, chunks) where chunks has shape (n_chunks, chunk_size).
    """
    iq = np.asarray(iq).ravel()
    if iq.dtype != np.complex128 and iq.dtype != np.complex64:
        iq = iq.astype(np.complex128)

    n = iq.size
    if n == 0:
        return np.zeros(0, dtype=np.int64), np.zeros((0, chunk_size), dtype=np.complex128)

    n_chunks = n // chunk_size
    if n_chunks == 0:
        return np.zeros(0, dtype=np.int64), np.zeros((0, chunk_size), dtype=np.complex128)

    starts = np.arange(n_chunks, dtype=np.int64) * chunk_size
    stacked = iq[: n_chunks * chunk_size].reshape(n_chunks, chunk_size)
    return starts, stacked


def complex_to_two_channel(x: np.ndarray) -> np.ndarray:
    """Complex samples -> float array shape (2, L)."""
    x = np.asarray(x).ravel()
    return np.stack([np.real(x), np.imag(x)], axis=0).astype(np.float32, copy=False)


def take_center_frame(iq: np.ndarray, length: int = U_NET_INPUT_LENGTH) -> np.ndarray:
    """
    Take a contiguous slice of complex IQ of exactly `length` samples.
    If shorter, pads with zeros at the end.
    """
    iq = np.asarray(iq).ravel()
    if iq.size >= length:
        start = (iq.size - length) // 2
        return iq[start : start + length].astype(np.complex64, copy=False)
    out = np.zeros(length, dtype=np.complex64)
    out[: iq.size] = iq.astype(np.complex64, copy=False)
    return out


def scale_u_net_input(two_ch: np.ndarray, global_max: float) -> np.ndarray:
    """Apply training-time scaling: x / global_max."""
    if global_max <= 0:
        raise ValueError("global_max must be positive")
    return (two_ch / global_max).astype(np.float32, copy=False)
