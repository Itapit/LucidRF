from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, HttpUrl
import httpx

from lucidrf_inference.pipeline import InferencePipeline, InferencePipelineConfig
from lucidrf_inference.cf32_le import cf32_le_from_bytes

# Global pipeline instance
pipeline: InferencePipeline | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline
    # We assume models are in the 'models/' directory relative to CWD
    # In a real setup, these might come from env vars
    base_dir = Path(__file__).parent.parent.parent
    detector_path = base_dir / "models" / "machine_a_logistic_v1.pkl"
    denoiser_path = base_dir / "models" / "lucidrf_unet_checkpoint.pth"

    config = InferencePipelineConfig(
        detector_model_path=detector_path,
        denoiser_checkpoint_path=denoiser_path
    )
    
    print("Loading ML models. This might take a few seconds...")
    pipeline = InferencePipeline(config, device="cpu") # Use CPU by default, or "cuda" if available
    print("ML models loaded successfully.")
    
    yield
    
    # Cleanup if necessary
    pipeline = None

app = FastAPI(title="LucidRF ML Inference API", lifespan=lifespan)


class DetectRequest(BaseModel):
    file_url: str

class DenoiseRequest(BaseModel):
    input_url: str
    output_url: str


@app.get("/health")
async def health_check():
    if pipeline is None:
        return {"status": "starting"}
    return {"status": "ok"}


@app.post("/api/v1/jobs/detect")
async def run_detection(req: DetectRequest) -> Dict[str, Any]:
    if pipeline is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model not loaded")
        
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(req.file_url, timeout=60.0)
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
        raise HTTPException(status_code=400, detail=f"Failed to fetch file: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/jobs/denoise")
async def run_denoising(req: DenoiseRequest):
    if pipeline is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model not loaded")
        
    try:
        # 1. Download noisy file
        async with httpx.AsyncClient() as client:
            resp = await client.get(req.input_url, timeout=60.0)
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
        
        # 4. Upload to Minio using presigned PUT URL
        async with httpx.AsyncClient() as client:
            put_resp = await client.put(req.output_url, content=out_bytes, timeout=60.0)
            put_resp.raise_for_status()
            
        return {"status": "success"}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"HTTP error during download/upload: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
