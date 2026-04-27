from enum import Enum

class ModelPaths(str, Enum):
    DETECTOR = "machine_a_logistic_v1.pkl"
    DENOISER = "lucidrf_unet_checkpoint.pth"

class ErrorMessages(str, Enum):
    MODEL_NOT_LOADED = "Model not loaded"
    FAILED_FETCH_FILE = "Failed to fetch file: {}"
    INTERNAL_DETECTION_ERROR = "Internal server error during detection"
    HTTP_ERROR_DOWNLOAD_UPLOAD = "HTTP error during download/upload: {}"
    INTERNAL_DENOISING_ERROR = "Internal server error during denoising"

class ConfigConstants:
    DEFAULT_HTTP_TIMEOUT = 60.0
    DEFAULT_INFERENCE_DEVICE = "cpu"

class SpectrogramConstants:
    DEFAULT_NFFT = 256
    DEFAULT_FS = 1.0
