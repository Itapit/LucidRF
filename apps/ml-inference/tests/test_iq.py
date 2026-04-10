import sys
import unittest
from pathlib import Path

import numpy as np

_SRC = Path(__file__).resolve().parents[1] / "src"
if _SRC.is_dir() and str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from lucidrf_inference.iq import (
    complex_to_two_channel,
    iter_chunks_complex,
    scale_u_net_input,
    take_center_frame,
)
from lucidrf_inference.constants import DETECTOR_CHUNK_SIZE, U_NET_INPUT_LENGTH


class TestIQ(unittest.TestCase):
    def test_iter_chunks_empty(self):
        starts, chunks = iter_chunks_complex(np.array([], dtype=np.complex64))
        self.assertEqual(starts.size, 0)
        self.assertEqual(chunks.shape, (0, DETECTOR_CHUNK_SIZE))

    def test_iter_chunks_two(self):
        n = DETECTOR_CHUNK_SIZE * 2
        iq = np.exp(1j * np.linspace(0, 10, n)).astype(np.complex64)
        starts, chunks = iter_chunks_complex(iq)
        self.assertEqual(chunks.shape, (2, DETECTOR_CHUNK_SIZE))
        np.testing.assert_array_equal(starts, [0, DETECTOR_CHUNK_SIZE])

    def test_take_center_frame_pad(self):
        short = np.ones(100, dtype=np.complex64)
        out = take_center_frame(short, length=U_NET_INPUT_LENGTH)
        self.assertEqual(out.shape, (U_NET_INPUT_LENGTH,))
        self.assertTrue(np.allclose(out[:100], short))
        self.assertTrue(np.allclose(out[100:], 0))

    def test_scale(self):
        x = np.ones((2, 8), dtype=np.float32) * 4.0
        y = scale_u_net_input(x, global_max=2.0)
        np.testing.assert_allclose(y, 2.0)


if __name__ == "__main__":
    unittest.main()
