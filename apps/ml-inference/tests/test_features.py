import unittest

import numpy as np

from lucidrf_inference.constants import DEFAULT_DETECTOR_FEATURE_NAMES
from lucidrf_inference.features import compute_feature_row


class TestFeatures(unittest.TestCase):
    def test_row_keys(self):
        rng = np.random.default_rng(0)
        chunk = (rng.standard_normal(500) + 1j * rng.standard_normal(500)).astype(np.complex64)
        row = compute_feature_row(chunk, DEFAULT_DETECTOR_FEATURE_NAMES)
        self.assertEqual(set(row.keys()), set(DEFAULT_DETECTOR_FEATURE_NAMES))
        for v in row.values():
            self.assertIsInstance(v, float)


if __name__ == "__main__":
    unittest.main()
