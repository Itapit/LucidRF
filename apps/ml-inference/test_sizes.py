from pathlib import Path
from src.lucidrf_inference.cf32_le import cf32_le_from_bytes
from src.lucidrf_inference.pipeline import InferencePipeline, InferencePipelineConfig
import numpy as np

p = Path('../../cf32_tests/n43560_noisy_sinr+10.0db_gain0.2229_id018.bin')
if not p.exists():
    print(f"File {p} does not exist.")
    # Fallback to the other file
    p = Path('../../cf32_tests/n10000_noisy_sinr+10.0db_gain0.2021_id010.bin')

data = p.read_bytes()
print(f"Input file size: {len(data)} bytes")

iq = cf32_le_from_bytes(data)
print(f"Parsed IQ shape: {iq.shape}, size: {iq.size}, dtype: {iq.dtype}")

config = InferencePipelineConfig(
    detector_model_path=Path('models/machine_a_logistic_v1.pkl'),
    denoiser_checkpoint_path=Path('models/lucidrf_unet_checkpoint.pth')
)
pipeline = InferencePipeline(config, device="cpu")

result = pipeline.denoise(iq)
denoised_iq = result.denoised_iq
print(f"Denoised IQ shape: {denoised_iq.shape}, dtype: {denoised_iq.dtype}")

complex_data = denoised_iq[0, :] + 1j * denoised_iq[1, :]
print(f"Complex data shape: {complex_data.shape}, dtype: {complex_data.dtype}")

out_bytes = complex_data.astype("<c8").tobytes()
print(f"Output bytes size: {len(out_bytes)} bytes")
