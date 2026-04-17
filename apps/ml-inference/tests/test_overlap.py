import sys
import unittest
from pathlib import Path

import numpy as np
from scipy.signal.windows import hann

_SRC = Path(__file__).resolve().parents[1] / "src"
if _SRC.is_dir() and str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from lucidrf_inference.constants import U_NET_HOP_SAMPLES, U_NET_INPUT_LENGTH
from lucidrf_inference.iq import remove_dc_offset
from lucidrf_inference.overlap_denoise import (
    overlap_add_merge,
    padded_length_for_sliding,
    sliding_window_starts,
)


class TestOverlap(unittest.TestCase):
    def test_remove_dc_zero_mean(self):
        rng = np.random.default_rng(42)
        iq = (rng.standard_normal(5000) + 1j * rng.standard_normal(5000)).astype(np.complex64)
        iq += 3.0 + 4.0j
        out = remove_dc_offset(iq)
        self.assertLess(abs(np.mean(out)), 1e-5)

    def test_padded_length_short(self):
        self.assertEqual(padded_length_for_sliding(100, window=40960, hop=20480), 40960)

    def test_padded_length_multi_window(self):
        n = 100_000
        L, hop = U_NET_INPUT_LENGTH, U_NET_HOP_SAMPLES
        g = padded_length_for_sliding(n, window=L, hop=hop)
        self.assertEqual(g, 102_400)
        starts = sliding_window_starts(g, window=L, hop=hop)
        self.assertEqual(starts.size, 4)
        self.assertTrue(starts[-1] + L >= n)

    def test_overlap_add_flat_sum(self):
        """Hann OLA of constant patches should yield ~constant in the fully overlapped region."""
        L = U_NET_INPUT_LENGTH
        hop = U_NET_HOP_SAMPLES
        k = 3
        starts = np.arange(k, dtype=np.int64) * hop
        pad_len = (k - 1) * hop + L
        taper = hann(L, sym=True).astype(np.float64)
        patches = np.ones((k, 2, L), dtype=np.float32)
        merged = overlap_add_merge(patches, starts, pad_len, taper)
        inner = merged[0, hop : pad_len - hop]
        self.assertLess(float(np.ptp(inner)), 0.02)
        self.assertTrue(np.all(np.isfinite(merged)))


if __name__ == "__main__":
    unittest.main()
