from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, HttpUrl
import httpx
import numpy as np

from lucidrf_inference.pipeline import InferencePipeline, InferencePipelineConfig
from lucidrf_inference.cf32_le import cf32_le_from_bytes
from .metrics import calculate_denoising_metrics
from .visualization import generate_spectrogram_comparison
from .constants.constants import ModelPaths, ErrorMessages, ConfigConstants

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ml_inference")

# Global pipeline instance
pipeline: InferencePipeline | None = None
http_client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline
    global http_client
    
    base_dir = Path(__file__).parent.parent.parent
    
    # Read configuration from environment variables with sensible defaults
    detector_path = Path(os.getenv("DETECTOR_MODEL_PATH", base_dir / "models" / ModelPaths.DETECTOR.value))
    denoiser_path = Path(os.getenv("DENOISER_MODEL_PATH", base_dir / "models" / ModelPaths.DENOISER.value))
    device = os.getenv("INFERENCE_DEVICE", ConfigConstants.DEFAULT_INFERENCE_DEVICE)

    config = InferencePipelineConfig(
        detector_model_path=detector_path,
        denoiser_checkpoint_path=denoiser_path
    )
    
    http_client = httpx.AsyncClient()
    
    logger.info(f"Loading ML models on device '{device}'. This might take a few seconds...")
    try:
        pipeline = InferencePipeline(config, device=device)
        logger.info("ML models loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load ML models: {e}")
        raise e
    
    yield
    
    # Cleanup if necessary
    pipeline = None
    if http_client is not None:
        await http_client.aclose()
        http_client = None

app = FastAPI(title="LucidRF ML Inference API", lifespan=lifespan)


class DetectRequest(BaseModel):
    file_url: str

class DenoiseRequest(BaseModel):
    input_url: str
    output_url: str
    spectrogram_url: str


@app.get("/health")
async def health_check():
    if pipeline is None:
        return {"status": "starting"}
    return {"status": "ok"}


@app.post("/api/v1/jobs/detect")
async def run_detection(req: DetectRequest) -> Dict[str, Any]:
    if pipeline is None or http_client is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=ErrorMessages.MODEL_NOT_LOADED.value)
        
    try:
        resp = await http_client.get(req.file_url, timeout=ConfigConstants.DEFAULT_HTTP_TIMEOUT)
        resp.raise_for_status()
        raw_bytes = resp.content
            
        iq_data = cf32_le_from_bytes(raw_bytes)
        
        # Run detection
        result = pipeline.detect(iq_data)
        
        # probabilities and chunk_starts are numpy arrays, need to convert to list for JSON serialization
        return {
            "probabilities": result.probabilities.tolist(),
            "chunk_starts": result.chunk_starts.tolist()
        }
    except httpx.HTTPError as e:
        logger.error(f"HTTP error during file fetch: {e}")
        raise HTTPException(status_code=400, detail=ErrorMessages.FAILED_FETCH_FILE.value.format(str(e)))
    except Exception as e:
        logger.exception("Unexpected error during detection job")
        raise HTTPException(status_code=500, detail=ErrorMessages.INTERNAL_DETECTION_ERROR.value)


@app.post("/api/v1/jobs/denoise")
async def run_denoising(req: DenoiseRequest):
    if pipeline is None or http_client is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=ErrorMessages.MODEL_NOT_LOADED.value)
        
    try:
        # 1. Download noisy file
        resp = await http_client.get(req.input_url, timeout=ConfigConstants.DEFAULT_HTTP_TIMEOUT)
        resp.raise_for_status()
        raw_bytes = resp.content
            
        iq_data = cf32_le_from_bytes(raw_bytes)
        
        # 2. Denoise
        result = pipeline.denoise(iq_data)
        denoised_iq = result.denoised_iq
        
        # 3. Convert back to little-endian complex64 bytes
        # denoised_iq is shape (2, N) float32, where row 0 is I and row 1 is Q
        complex_data = denoised_iq[0, :] + 1j * denoised_iq[1, :]
        out_bytes = complex_data.astype("<c8").tobytes()
        
        # 4. Calculate Denoising Metrics
        metrics = calculate_denoising_metrics(iq_data, complex_data)
        
        # 5. Generate Spectrogram Image
        logger.info("Generating before/after spectrogram comparison...")
        spectrogram_bytes = generate_spectrogram_comparison(iq_data, complex_data)
        
        # 6. Upload outputs to Minio using presigned PUT URLs
        # Upload clean binary
        put_resp = await http_client.put(req.output_url, content=out_bytes, timeout=ConfigConstants.DEFAULT_HTTP_TIMEOUT)
        put_resp.raise_for_status()
        
        # Upload spectrogram image
        spec_resp = await http_client.put(
            req.spectrogram_url, 
            content=spectrogram_bytes, 
            timeout=ConfigConstants.DEFAULT_HTTP_TIMEOUT,
            headers={"Content-Type": "image/png"}
        )
        spec_resp.raise_for_status()
            
        return {
            "status": "success",
            "metrics": metrics
        }
    except httpx.HTTPError as e:
        logger.error(f"HTTP error during file fetch/upload: {e}")
        raise HTTPException(status_code=400, detail=ErrorMessages.HTTP_ERROR_DOWNLOAD_UPLOAD.value.format(str(e)))
    except Exception as e:
        logger.exception("Unexpected error during denoising job")
        raise HTTPException(status_code=500, detail=ErrorMessages.INTERNAL_DENOISING_ERROR.value)
