"""
Run barrage detection on all available fixture .bin files.

Scans:
- ``<repo>/presentation_demo/*.bin`` (repo root, sibling of ``apps/``)

Run from ``apps/ml-inference``:
  python -m unittest tests.test_detection_fixtures -v
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

_SRC = Path(__file__).resolve().parents[1] / "src"
if _SRC.is_dir() and str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from lucidrf_inference.barrage_detector import BarrageDetector
from lucidrf_inference.cf32_le import cf32_le_from_file
from lucidrf_inference.constants import DETECTOR_CHUNK_SIZE
from server.constants.constants import ModelPaths


def _preview_floats(values, max_items: int = 8) -> str:
    vals = [float(x) for x in values]
    if len(vals) <= max_items:
        return ", ".join(f"{v:.6f}" for v in vals)
    head = ", ".join(f"{v:.6f}" for v in vals[:max_items])
    return f"{head}, ... ({len(vals)} total)"


def _preview_ints(values, max_items: int = 8) -> str:
    vals = [int(x) for x in values]
    if len(vals) <= max_items:
        return str(vals)
    return f"{vals[:max_items]} ... ({len(vals)} total)"


def _repo_root() -> Path:
    # tests/ -> ml-inference/ -> apps/ -> LucidRF repo root
    return Path(__file__).resolve().parents[3]


def _presentation_demo_bins() -> Path:
    return _repo_root() / "presentation_demo"


def _model_path() -> Path:
    return Path(__file__).resolve().parent.parent / "models" / ModelPaths.DETECTOR_PATH.value


class TestDetectionOnFixtures(unittest.TestCase):
    def test_detect_all_fixture_bins_prints_results(self) -> None:
        all_dir = _presentation_demo_bins()
        bins = sorted(all_dir.glob("*.bin"))
        if not bins:
            self.skipTest(
                f"No .bin files under {all_dir}; add cf32 fixtures to presentation_demo/ at repo root."
            )
        mp = _model_path()
        if not mp.exists():
            self.skipTest(f"Detector model missing: {mp}")

        detector = BarrageDetector(mp)
        decision_threshold = 0.5
        noisy_detected = 0
        clean_detected = 0
        no_chunks = 0
        expected_counts = {"expected_clean": 0, "expected_noisy": 0, "expected_unknown": 0}
        matrix = {
            "expected_clean": {"NOISE": 0, "CLEAN": 0, "NO_CHUNKS": 0},
            "expected_noisy": {"NOISE": 0, "CLEAN": 0, "NO_CHUNKS": 0},
            "expected_unknown": {"NOISE": 0, "CLEAN": 0, "NO_CHUNKS": 0},
        }
        print(
            f"\nBarrageDetector on {len(bins)} files (chunk_size={DETECTOR_CHUNK_SIZE})\n"
            f"{'=' * 80}"
        )
        print(f"Source folder: {all_dir}")
        print(f"Decision threshold: P(barrage) >= {decision_threshold:.2f}\n")

        for p in bins:
            name = p.name.lower()
            if "_clean_" in name or name.endswith("_clean.bin"):
                expected = "expected_clean"
            elif "_noisy_" in name or name.endswith("_noisy.bin") or "noisy" in name:
                expected = "expected_noisy"
            else:
                expected = "expected_unknown"
            expected_counts[expected] += 1

            iq = cf32_le_from_file(p)
            probs, starts = detector.predict_proba_chunks(iq)
            n = int(iq.shape[0])
            n_chunks = int(probs.shape[0])
            print(f"{p.name}  [{expected}]")
            if n_chunks == 0:
                no_chunks += 1
                matrix[expected]["NO_CHUNKS"] += 1
                print(
                    f"  verdict=NO_CHUNKS  n_samples={n}  "
                    f"(need >= {DETECTOR_CHUNK_SIZE} for one detector chunk)"
                )
            else:
                max_p = float(probs.max())
                mean_p = float(probs.mean())
                verdict = "NOISE" if max_p >= decision_threshold else "CLEAN"
                if verdict == "NOISE":
                    noisy_detected += 1
                else:
                    clean_detected += 1
                matrix[expected][verdict] += 1
                parts = [f"{float(probs[i]):.6f}" for i in range(n_chunks)]
                print(
                    f"  verdict={verdict:<5}  n_samples={n}  n_full_chunks={n_chunks}  "
                    f"mean_p={mean_p:.6f}  max_p={max_p:.6f}"
                )
                print(f"  chunk_starts={_preview_ints(starts)}")
                print(f"  P(barrage) per chunk=[{_preview_floats(probs)}]")

        print(f"\n{'-' * 80}")
        print(
            "Summary: "
            f"NOISE={noisy_detected}, CLEAN={clean_detected}, NO_CHUNKS={no_chunks}, TOTAL={len(bins)}"
        )
        print(
            "Expected counts: "
            f"clean={expected_counts['expected_clean']}, "
            f"noisy={expected_counts['expected_noisy']}, "
            f"unknown={expected_counts['expected_unknown']}"
        )
        print("By expected class:")
        for key in ("expected_clean", "expected_noisy", "expected_unknown"):
            m = matrix[key]
            print(f"  {key}: NOISE={m['NOISE']}, CLEAN={m['CLEAN']}, NO_CHUNKS={m['NO_CHUNKS']}")
        print(f"{'=' * 80}\n")

        self.assertGreater(len(bins), 0)


if __name__ == "__main__":
    unittest.main()
