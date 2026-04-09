#!/usr/bin/env python3
"""
Generate cf32_le test fixtures from CommSignal2 HDF5 (MIT RF Challenge).

For each length bucket, writes paired clean / noisy .bin files (same row, same crop).
Noisy files use fresh complex-Gaussian barrage + mix_signals() (same math as ml/src/mixing_utils.py).

Requires: pip install h5py (or: pip install -e ".[fixtures]" from apps/ml-inference).

Inference: use InferencePipelineConfig.u_net_global_scale from
``ml/data/processed/U-net_dataset/scaling_factors.txt`` for U-Net; detector runs on raw cf32-loaded IQ.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np

# Optional: h5py
try:
    import h5py
except ImportError as e:
    raise SystemExit("Install h5py: pip install h5py") from e


def _calculate_power(signal: np.ndarray) -> float:
    return float(np.mean(np.abs(signal) ** 2))


def mix_signals(
    clean_signal: np.ndarray,
    interference_signal: np.ndarray,
    target_sinr_db: float,
) -> tuple[np.ndarray, float]:
    """Same behavior as ml/src/mixing_utils.mix_signals (2-channel float, shape (2, L))."""
    p_clean = _calculate_power(clean_signal)
    p_interference = _calculate_power(interference_signal)
    if p_interference == 0:
        return clean_signal, 0.0
    sinr_linear = 10 ** (target_sinr_db / 10.0)
    alpha = np.sqrt(p_clean / (p_interference * sinr_linear))
    mixed = clean_signal + (alpha * interference_signal)
    return mixed, float(alpha)


def two_channel_to_cf32_bytes(two_ch: np.ndarray) -> bytes:
    x = np.asarray(two_ch, dtype=np.float32)
    if x.ndim != 2 or x.shape[0] != 2:
        raise ValueError(f"expected (2, L), got {x.shape}")
    iq = x[0] + 1j * x[1]
    return np.asarray(iq, dtype=np.complex64).tobytes()


def hdf5_row_to_complex(row: np.ndarray) -> np.ndarray:
    """One row from MIT dataset -> 1D complex64."""
    row = np.asarray(row)
    if np.iscomplexobj(row):
        return row.astype(np.complex64, copy=False).ravel()
    if row.ndim == 2 and row.shape[1] == 2:
        return (row[:, 0] + 1j * row[:, 1]).astype(np.complex64)
    raise ValueError(f"Unsupported row dtype/shape: {row.dtype} {row.shape}")


def complex_to_two_ch(iq: np.ndarray) -> np.ndarray:
    iq = np.asarray(iq).ravel().astype(np.complex64)
    return np.stack([iq.real.astype(np.float32), iq.imag.astype(np.float32)], axis=0)


def load_commsignal2_matrix(h5_path: Path) -> np.ndarray:
    with h5py.File(h5_path, "r") as f:
        if "dataset" not in f:
            raise KeyError(f"'dataset' not in {h5_path}; keys: {list(f.keys())}")
        return np.asarray(f["dataset"][:])


def main() -> None:
    ap = argparse.ArgumentParser(description="Generate CommSignal2 cf32_le fixtures (clean + noisy pairs).")
    ap.add_argument(
        "--repo-root",
        type=Path,
        default=None,
        help="LucidRF repo root (default: inferred from script path)",
    )
    ap.add_argument(
        "--h5",
        type=Path,
        default=None,
        help="Path to CommSignal2_raw_data.h5 (default: under ml/data/raw/...)",
    )
    ap.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Output directory (default: tools/presentation_demo/fixtures/commsignal2)",
    )
    ap.add_argument("--seed", type=int, default=42, help="Base RNG seed for reproducible barrage noise")
    ap.add_argument(
        "--pairs-per-length",
        type=int,
        default=4,
        help="How many row/crop pairs per length bucket (each yields clean + noisy)",
    )
    args = ap.parse_args()

    here = Path(__file__).resolve()
    repo = args.repo_root if args.repo_root is not None else here.parents[4]
    h5_path = args.h5
    if h5_path is None:
        h5_path = (
            repo
            / "ml/data/raw/mit-rf-challenge/dataset/interferenceset_frame/CommSignal2_raw_data.h5"
        )
    out_dir = args.out_dir if args.out_dir is not None else here.parent / "fixtures" / "commsignal2"

    if not h5_path.exists():
        raise SystemExit(f"Missing HDF5: {h5_path}")

    print(f"Loading {h5_path} ...")
    raw = load_commsignal2_matrix(h5_path)
    if raw.ndim != 2:
        raise SystemExit(f"Expected 2D dataset array, got shape {raw.shape}")

    n_rows, row_len = raw.shape[0], int(raw.shape[1])
    print(f"shape (rows, samples) = ({n_rows}, {row_len})")

    # Length buckets: None = full row
    length_specs: list[int | None] = [5000, 9999, 10000, 40960, None]
    # Demo-focused: keep SINR positive (training used negatives; fixtures should look "good").
    sinr_cycle = (5.0, 10.0, 15.0, 20.0)

    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.csv"
    meta_json_path = out_dir / "fixture_meta.json"

    rows_out: list[dict[str, object]] = []
    meta: dict[str, object] = {
        "source_h5": str(h5_path.resolve()),
        "h5_shape": list(raw.shape),
        "mixing": "mix_signals(clean, complex_gaussian_barrage, sinr_db) — same as ml/src/mixing_utils.py",
        "length_buckets": [str(x) if x is not None else "full_row" for x in length_specs],
        "pairs_per_length": args.pairs_per_length,
        "seed": args.seed,
    }

    for li, length_spec in enumerate(length_specs):
        if length_spec is None:
            n_samples = row_len
            tag = "full"
        else:
            n_samples = int(length_spec)
            tag = str(n_samples)
            if n_samples > row_len:
                raise SystemExit(
                    f"Length {n_samples} exceeds row length {row_len}; adjust bucket or use different dataset."
                )

        for pair_i in range(args.pairs_per_length):
            # Spread row indices across the HDF5 (deterministic)
            row_idx = (li * 17 + pair_i * 23) % n_rows
            row_complex = hdf5_row_to_complex(raw[row_idx, :])
            segment = np.asarray(row_complex[:n_samples], dtype=np.complex64)
            two_clean = complex_to_two_ch(segment)

            sinr_db = sinr_cycle[pair_i % len(sinr_cycle)]
            # Reproducible barrage tensor per (row, length, pair)
            rng = np.random.default_rng(args.seed + row_idx * 1_000_003 + n_samples * 97 + pair_i)
            barrage = rng.standard_normal((2, n_samples)).astype(np.float32)

            two_noisy, alpha = mix_signals(two_clean, barrage, sinr_db)

            stem = f"fixture_comm2_r{row_idx:03d}_n{tag}_p{pair_i}"
            clean_path = out_dir / f"{stem}_clean.bin"
            noisy_path = out_dir / f"{stem}_noisy_sinr{sinr_db:+.1f}db.bin"

            clean_path.write_bytes(two_channel_to_cf32_bytes(two_clean))
            noisy_path.write_bytes(two_channel_to_cf32_bytes(two_noisy))

            for path, kind, alpha_v, sdb in (
                (clean_path, "clean", None, None),
                (noisy_path, "noisy", alpha, sinr_db),
            ):
                rec = {
                    "filename": path.name,
                    "row_index": row_idx,
                    "n_complex_samples": n_samples,
                    "file_bytes": path.stat().st_size,
                    "kind": kind,
                    "sinr_db": "" if sdb is None else sdb,
                    "alpha": "" if alpha_v is None else alpha_v,
                    "length_bucket": tag,
                }
                rows_out.append(rec)

            print(f"Wrote {clean_path.name} / {noisy_path.name}  (n={n_samples}, sinr={sinr_db} dB noisy)")

    fieldnames = [
        "filename",
        "row_index",
        "n_complex_samples",
        "file_bytes",
        "kind",
        "sinr_db",
        "alpha",
        "length_bucket",
    ]
    with manifest_path.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows_out)

    meta["files"] = len(rows_out)
    meta_json_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    print(f"\nManifest: {manifest_path}")
    print(f"Meta: {meta_json_path}")


if __name__ == "__main__":
    main()
