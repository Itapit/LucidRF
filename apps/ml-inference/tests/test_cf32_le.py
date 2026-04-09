import struct
import tempfile
import unittest
from pathlib import Path

import numpy as np

from lucidrf_inference.cf32_le import cf32_le_from_bytes, cf32_le_from_file


class TestCf32Le(unittest.TestCase):
    def test_roundtrip_layout(self):
        i0, q0 = 1.25, -3.0
        i1, q1 = 0.0, 2.5
        blob = struct.pack("<4f", i0, q0, i1, q1)
        x = cf32_le_from_bytes(blob)
        self.assertEqual(x.shape, (2,))
        np.testing.assert_allclose(x[0], i0 + 1j * q0)
        np.testing.assert_allclose(x[1], i1 + 1j * q1)

    def test_offset_skips_header(self):
        header = b"HDR\x00"
        i0, q0 = 1.0, 2.0
        blob = header + struct.pack("<2f", i0, q0)
        x = cf32_le_from_bytes(blob, offset=len(header))
        self.assertEqual(x.shape, (1,))
        np.testing.assert_allclose(x[0], i0 + 1j * q0)

    def test_partial_sample_raises(self):
        with self.assertRaises(ValueError):
            cf32_le_from_bytes(b"\x00" * 7)

    def test_from_file(self):
        i0, q0 = -1.0, 0.5
        blob = struct.pack("<2f", i0, q0)
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "iq.cf32"
            p.write_bytes(blob)
            x = cf32_le_from_file(p)
            np.testing.assert_allclose(x[0], i0 + 1j * q0)


if __name__ == "__main__":
    unittest.main()
