"""Load U-Net checkpoint and run forward pass."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import torch

from lucidrf_inference.unet import LucidRFUNet


def _load_state_dict(path: Path, map_location: torch.device) -> dict:
    try:
        raw = torch.load(path, map_location=map_location, weights_only=False)
    except TypeError:
        raw = torch.load(path, map_location=map_location)
    if isinstance(raw, dict) and "model_state_dict" in raw:
        return raw["model_state_dict"]
    if isinstance(raw, dict) and any(k.startswith("inc.") for k in raw):
        return raw
    raise ValueError(
        f"Unrecognized checkpoint at {path}: expected dict with 'model_state_dict' or raw state_dict keys."
    )


class IQDenoiser:
    def __init__(
        self,
        checkpoint_path: Path | str,
        device: str | torch.device | None = None,
        n_channels: int = 2,
        n_classes: int = 2,
        base: int = 16,
    ):
        self._path = Path(checkpoint_path)
        self._device = torch.device(device) if device is not None else torch.device("cpu")
        self._model = LucidRFUNet(n_channels=n_channels, n_classes=n_classes, base=base).to(self._device)
        state = _load_state_dict(self._path, map_location=self._device)
        self._model.load_state_dict(state)
        self._model.eval()

    @property
    def device(self) -> torch.device:
        return self._device

    @torch.inference_mode()
    def denoise_two_channel(self, x: np.ndarray) -> np.ndarray:
        """
        Args:
            x: float32 array shape (2, L) — same scaling as training (e.g. divided by global max).

        Returns:
            float32 array shape (2, L) — network output (denoised I/Q).
        """
        t = torch.from_numpy(np.asarray(x, dtype=np.float32)).unsqueeze(0).to(self._device)
        y = self._model(t)
        return y.squeeze(0).detach().cpu().numpy().astype(np.float32)
