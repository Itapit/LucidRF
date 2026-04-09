"""Sliding-window U-Net inference with DC removal and Hann overlap-add synthesis."""

from __future__ import annotations

import numpy as np
from scipy.signal.windows import hann

from lucidrf_inference.constants import U_NET_HOP_SAMPLES, U_NET_INPUT_LENGTH
from lucidrf_inference.iq import complex_to_two_channel, pad_iq_to_length, remove_dc_offset, scale_u_net_input


def padded_length_for_sliding(iq_len: int, window: int = U_NET_INPUT_LENGTH, hop: int = U_NET_HOP_SAMPLES) -> int:
    """Minimum length so that strided windows cover the entire original signal (zero-padded at end)."""
    if iq_len <= 0:
        return 0
    if iq_len < window:
        return window
    num_starts = int(np.ceil((iq_len - window) / hop)) + 1
    return (num_starts - 1) * hop + window


def sliding_window_starts(padded_len: int, window: int = U_NET_INPUT_LENGTH, hop: int = U_NET_HOP_SAMPLES) -> np.ndarray:
    if padded_len < window:
        return np.zeros(0, dtype=np.int64)
    n = (padded_len - window) // hop + 1
    return np.arange(n, dtype=np.int64) * hop


def _synthesis_taper(window_len: int, num_windows: int) -> np.ndarray:
    """Hann cross-fade weights per window; uniform if only one window (no edge attenuation)."""
    if num_windows <= 1:
        return np.ones(window_len, dtype=np.float64)
    return hann(window_len, sym=True).astype(np.float64)


def overlap_add_merge(
    patches: np.ndarray,
    starts: np.ndarray,
    total_len: int,
    taper: np.ndarray,
) -> np.ndarray:
    """
    patches: (K, 2, L), starts: (K,), taper: (L,)
    """
    k, two, L = patches.shape
    if two != 2:
        raise ValueError("Expected patches shape (K, 2, L)")
    if taper.shape[0] != L:
        raise ValueError("taper length must match L")
    acc = np.zeros((2, total_len), dtype=np.float64)
    wsum = np.zeros(total_len, dtype=np.float64)
    t = taper[np.newaxis, :]
    for i in range(k):
        s = int(starts[i])
        acc[:, s : s + L] += patches[i].astype(np.float64) * t
        wsum[s : s + L] += taper
    eps = 1e-12
    out = np.zeros((2, total_len), dtype=np.float64)
    mask = wsum > eps
    out[:, mask] = acc[:, mask] / wsum[mask]
    return out.astype(np.float32)


def denoise_iq_sliding(
    iq: np.ndarray,
    denoise_two_channel,
    global_max: float,
    window: int = U_NET_INPUT_LENGTH,
    hop: int = U_NET_HOP_SAMPLES,
) -> np.ndarray:
    """
    DC removal -> pad -> sliding windows -> scale -> denoise_two_channel per window -> overlap-add.

    Returns float32 array (2, N) where N is the original IQ length (not padded length).
    """
    if global_max <= 0:
        raise ValueError("global_max must be positive")

    iq = np.asarray(iq).ravel()
    n_orig = iq.size
    if n_orig == 0:
        return np.zeros((2, 0), dtype=np.float32)

    centered = remove_dc_offset(iq)
    pad_len = padded_length_for_sliding(n_orig, window=window, hop=hop)
    padded = pad_iq_to_length(centered, pad_len)
    starts = sliding_window_starts(pad_len, window=window, hop=hop)
    k = starts.size
    taper = _synthesis_taper(window, k)

    patches = np.empty((k, 2, window), dtype=np.float32)
    for i in range(k):
        s = int(starts[i])
        w = padded[s : s + window]
        two = complex_to_two_channel(w)
        scaled = scale_u_net_input(two, global_max)
        patches[i] = denoise_two_channel(scaled)

    merged = overlap_add_merge(patches, starts, pad_len, taper)
    return merged[:, :n_orig]
