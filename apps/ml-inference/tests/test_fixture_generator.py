import sys
import unittest
from pathlib import Path

import numpy as np

_SRC = Path(__file__).resolve().parents[1] / "src"
if _SRC.is_dir() and str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from lucidrf_inference.cf32_le import cf32_le_from_bytes

try:
    from tools.presentation_demo.generate_commsignal2_fixtures import mix_signals, two_channel_to_cf32_bytes
except ImportError:
    mix_signals = None  # type: ignore[misc, assignment]
    two_channel_to_cf32_bytes = None  # type: ignore[misc, assignment]


class TestFixtureGenerator(unittest.TestCase):
    def setUp(self) -> None:
        if two_channel_to_cf32_bytes is None or mix_signals is None:
            self.skipTest(
                "Optional tools.presentation_demo package not present (fixture generator scripts)."
            )

    def test_two_channel_to_cf32_bytes_roundtrip(self):
        n = 1234
        rng = np.random.default_rng(0)
        two = rng.standard_normal((2, n), dtype=np.float32)

        blob = two_channel_to_cf32_bytes(two)
        self.assertEqual(len(blob), n * 8)  # 8 bytes per complex64 sample

        iq = cf32_le_from_bytes(blob)
        self.assertEqual(iq.shape, (n,))
        np.testing.assert_allclose(iq.real, two[0], rtol=0, atol=0)
        np.testing.assert_allclose(iq.imag, two[1], rtol=0, atol=0)

    def test_mix_signals_hits_target_sinr(self):
        n = 200_000
        rng = np.random.default_rng(1)
        clean = rng.standard_normal((2, n), dtype=np.float32)
        noise = rng.standard_normal((2, n), dtype=np.float32)
        target_sinr_db = 15.0

        mixed, alpha = mix_signals(clean, noise, target_sinr_db)
        self.assertGreater(alpha, 0.0)
        self.assertEqual(mixed.shape, clean.shape)

        # Recover achieved SINR from resulting mixture: clean / (alpha*noise)
        p_clean = float(np.mean(np.abs(clean) ** 2))
        p_noise_scaled = float(np.mean(np.abs((alpha * noise)) ** 2))
        achieved = 10.0 * np.log10(p_clean / p_noise_scaled)

        # Numeric tolerance: sample estimates + float32
        self.assertAlmostEqual(achieved, target_sinr_db, delta=0.2)

    def test_mix_signals_changes_signal(self):
        n = 10_000
        rng = np.random.default_rng(2)
        clean = rng.standard_normal((2, n), dtype=np.float32)
        noise = rng.standard_normal((2, n), dtype=np.float32)
        mixed, alpha = mix_signals(clean, noise, 10.0)
        self.assertGreater(alpha, 0.0)
        self.assertGreater(float(np.mean(np.abs(mixed - clean))), 0.0)


if __name__ == "__main__":
    unittest.main()

