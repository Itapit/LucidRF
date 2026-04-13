import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from pathlib import Path

from server.main import app

# Adjust path to the root cf32_tests folder
# test_main.py is in apps/ml-inference/tests/
# root is ../../../
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
SAMPLE_BIN_PATH = PROJECT_ROOT / "cf32_tests" / "n10000_noisy_sinr+10.0db_gain0.2021_id010.bin"

@pytest.fixture
def sample_cf32_data() -> bytes:
    """Read a sample .bin file to use as mocked HTTP response content."""
    assert SAMPLE_BIN_PATH.exists(), f"Sample data not found: {SAMPLE_BIN_PATH}"
    return SAMPLE_BIN_PATH.read_bytes()

def test_health_check():
    """Verify that the FastAPI health endpoint and lifespan ML model load correctly."""
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

@patch("server.main.httpx.AsyncClient")
def test_run_detection(mock_async_client_class, sample_cf32_data):
    """Verify that the detection endpoint downloads, parses, and infers correctly."""
    
    # 1. Create a mock for the HTTP response
    mock_response = AsyncMock()
    mock_response.content = sample_cf32_data
    mock_response.raise_for_status = lambda: None
    
    # 2. Create a mock for the AsyncClient instance
    mock_client_instance = AsyncMock()
    # Mock the get method to return our mock_response
    mock_client_instance.get.return_value = mock_response
    
    # 3. Setup context manager behavior for `async with httpx.AsyncClient() as client`
    mock_client_instance.__aenter__.return_value = mock_client_instance
    mock_client_instance.__aexit__.return_value = None
    
    # 4. Attach the instance to the mocked class
    mock_async_client_class.return_value = mock_client_instance

    with TestClient(app) as client:
        payload = {"file_url": "http://mock-minio:9000/bucket/test.bin"}
        response = client.post("/api/v1/jobs/detect", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "probabilities" in data
        assert "chunk_starts" in data
        assert isinstance(data["probabilities"], list)
        assert isinstance(data["chunk_starts"], list)
        
        # Ensure our mock was called exactly once with the correct URL
        mock_client_instance.get.assert_called_once_with(payload["file_url"], timeout=60.0)

@patch("server.main.httpx.AsyncClient")
def test_run_denoising(mock_async_client_class, sample_cf32_data):
    """Verify that the denoising endpoint processes data and uploads the output via PUT."""
    
    # 1. Create mock for GET response (input noisy file)
    mock_get_response = AsyncMock()
    mock_get_response.content = sample_cf32_data
    mock_get_response.raise_for_status = lambda: None

    # 2. Create mock for PUT response (output Minio upload)
    mock_put_response = AsyncMock()
    mock_put_response.raise_for_status = lambda: None

    # 3. Setup client instance
    mock_client_instance = AsyncMock()
    mock_client_instance.get.return_value = mock_get_response
    mock_client_instance.put.return_value = mock_put_response
    
    # Async context manager behavior
    mock_client_instance.__aenter__.return_value = mock_client_instance
    mock_client_instance.__aexit__.return_value = None
    
    mock_async_client_class.return_value = mock_client_instance

    with TestClient(app) as client:
        payload = {
            "input_url": "http://mock-minio:9000/bucket/input.bin",
            "output_url": "http://mock-minio:9000/bucket/output.bin"
        }
        response = client.post("/api/v1/jobs/denoise", json=payload)
        
        assert response.status_code == 200
        assert response.json() == {"status": "success"}
        
        # Verify GET was called for the input_url
        mock_client_instance.get.assert_called_once_with(payload["input_url"], timeout=60.0)
        
        # Verify PUT was called for the output_url
        mock_client_instance.put.assert_called_once()
        put_call_args = mock_client_instance.put.call_args
        
        # Check the URL argument
        assert put_call_args[0][0] == payload["output_url"]
        
        # Check the content keyword argument (the actual binary data being uploaded)
        assert "content" in put_call_args[1]
        assert isinstance(put_call_args[1]["content"], bytes)
        assert len(put_call_args[1]["content"]) > 0
        
        # In fact, we expect the output bytes to be the same size as the input bytes
        # because the UNET output shape is preserved!
        assert len(put_call_args[1]["content"]) == len(sample_cf32_data)
