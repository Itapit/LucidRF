"""
High-level inference API: barrage scoring on IQ + U-Net denoising (sliding windows + DC removal).

Transport (HTTP, queues) stays out of this module by design.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np

from lucidrf_inference.barrage_detector import BarrageDetector
from lucidrf_inference.constants import (
    DETECTOR_CHUNK_SIZE,
    U_NET_GLOBAL_SCALE,
    U_NET_HOP_SAMPLES,
    U_NET_INPUT_LENGTH,
)
from lucidrf_inference.denoiser import IQDenoiser
from lucidrf_inference.iq import complex_to_two_channel, remove_dc_offset, scale_u_net_input, take_center_frame
from lucidrf_inference.overlap_denoise import denoise_iq_sliding
from lucidrf_inference.types import DenoiseResult, DetectionResult


@dataclass(frozen=True)
class InferencePipelineConfig:
    """Paths and scaling for production inference."""

    detector_model_path: Path
    denoiser_checkpoint_path: Path
    """Divide U-Net inputs by this value (training used a global max over the dataset)."""
    u_net_global_scale: float = U_NET_GLOBAL_SCALE


class InferencePipeline:
    """
    Loads detector + denoiser once.

    - `detect` — logistic model on non-overlapping 10k chunks.
    - `denoise` — DC removal, 50% overlapping U-Net windows, Hann overlap-add (default).
    - `denoise_center_frame` — single centered frame (still with DC removal); useful for quick checks.
    """

    def __init__(self, config: InferencePipelineConfig, device: str | None = None):
        self._config = config
        self._detector = BarrageDetector(config.detector_model_path)
        self._denoiser = IQDenoiser(config.denoiser_checkpoint_path, device=device)

    def detect(self, iq: np.ndarray, chunk_size: int = DETECTOR_CHUNK_SIZE) -> DetectionResult:
        probs, starts = self._detector.predict_proba_chunks(iq, chunk_size=chunk_size)
        return DetectionResult(probabilities=probs, chunk_starts=starts)

    def denoise(
        self,
        iq: np.ndarray,
        global_scale: float | None = None,
        *,
        window: int = U_NET_INPUT_LENGTH,
        hop: int = U_NET_HOP_SAMPLES,
    ) -> DenoiseResult:
        """
        Full-segment denoise: remove DC on the IQ, extract strided windows (default 50% overlap),
        run U-Net per window, reconstruct with Hann-weighted overlap-add. Output length matches input.
        """
        scale = global_scale if global_scale is not None else self._config.u_net_global_scale
        out = denoise_iq_sliding(
            iq,
            self._denoiser.denoise_two_channel,
            scale,
            window=window,
            hop=hop,
        )
        return DenoiseResult(denoised_iq=out)

    def denoise_center_frame(
        self,
        iq: np.ndarray,
        frame_length: int = U_NET_INPUT_LENGTH,
        global_scale: float | None = None,
    ) -> DenoiseResult:
        """
        Single frame: DC removal, crop/pad to `frame_length`, scale, U-Net. Output shape (2, frame_length).
        """
        scale = global_scale if global_scale is not None else self._config.u_net_global_scale

        iq_dc = remove_dc_offset(np.asarray(iq).ravel())
        frame = take_center_frame(iq_dc, length=frame_length)
        two = complex_to_two_channel(frame)
        scaled = scale_u_net_input(two, scale)
        out = self._denoiser.denoise_two_channel(scaled)
        return DenoiseResult(denoised_iq=out)

    def denoise_pre_scaled_frame(self, two_channel_float: np.ndarray) -> DenoiseResult:
        """If you already applied scaling to match training, pass shape (2, L) float32."""
        out = self._denoiser.denoise_two_channel(two_channel_float)
        return DenoiseResult(denoised_iq=out)
