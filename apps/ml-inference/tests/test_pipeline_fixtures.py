"""
Run full inference (detection + U-Net denoise with DC removal / overlap-add) on fixture .bin files.

Scans:
- ``<repo>/presentation_demo/*.bin`` (repo root, sibling of ``apps/``)

Run from ``apps/ml-inference``:
  python -m unittest tests.test_pipeline_fixtures -v
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

import numpy as np

_SRC = Path(__file__).resolve().parents[1] / "src"
if _SRC.is_dir() and str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from lucidrf_inference.cf32_le import cf32_le_from_file
from lucidrf_inference.constants import DETECTOR_CHUNK_SIZE, U_NET_GLOBAL_SCALE
from lucidrf_inference.pipeline import InferencePipeline, InferencePipelineConfig


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _presentation_demo_bins() -> Path:
    return _repo_root() / "presentation_demo"


def _models_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "models"


class TestFullPipelineOnFixtures(unittest.TestCase):
    def test_pipeline_all_fixture_bins(self) -> None:
        bin_dir = _presentation_demo_bins()
        bins = sorted(bin_dir.glob("*.bin"))
        if not bins:
            self.skipTest(
                f"No .bin files under {bin_dir}; add cf32 fixtures to presentation_demo/ at repo root."
            )

        detector_path = _models_dir() / "machine_a_logistic_v1.pkl"
        unet_path = _models_dir() / "lucidrf_unet_checkpoint.pth"
        if not detector_path.exists():
            self.skipTest(f"Detector model missing: {detector_path}")
        if not unet_path.exists():
            self.skipTest(f"U-Net checkpoint missing: {unet_path}")

        cfg = InferencePipelineConfig(
            detector_model_path=detector_path,
            denoiser_checkpoint_path=unet_path,
        )
        pipe = InferencePipeline(cfg, device="cpu")

        print(
            f"\nInferencePipeline (detect + denoise) on {len(bins)} files\n"
            f"global_scale={U_NET_GLOBAL_SCALE:.12f}  chunk_size={DETECTOR_CHUNK_SIZE}\n"
            f"{'=' * 80}"
        )
        print(f"Source folder: {bin_dir}\n")

        for p in bins:
            iq = cf32_le_from_file(p)
            n = int(iq.shape[0])

            det = pipe.detect(iq)
            self.assertEqual(det.probabilities.ndim, 1)
            self.assertEqual(det.chunk_starts.shape, det.probabilities.shape)
            self.assertTrue(np.all(np.isfinite(det.probabilities)))

            den = pipe.denoise(iq)
            out = den.denoised_iq
            self.assertEqual(out.shape, (2, n))
            self.assertEqual(out.dtype, np.float32)
            self.assertTrue(np.all(np.isfinite(out)))

            rms = float(np.sqrt(np.mean(out**2)))
            print(
                f"{p.name}  n={n}  n_chunks={det.probabilities.size}  "
                f"det_max_p={float(det.probabilities.max()) if det.probabilities.size else 0.0:.6f}  "
                f"denoise_rms={rms:.6f}"
            )

        print(f"{'=' * 80}\n")
        self.assertGreater(len(bins), 0)


if __name__ == "__main__":
    unittest.main()
