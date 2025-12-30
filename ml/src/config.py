from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
RAW_DATA_FILE = DATA_DIR / "GOLD_XYZ_OSC.0001_1024.hdf5"
PROCESSED_DIR = DATA_DIR / "processed"

MODELS_DIR = BASE_DIR / "models"

SPLIT_MAP_FILE = PROCESSED_DIR / "master_split_indices.npz"

# Ensure directories exist
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Shared Constants (e.g., Sampling Rate, Feature Names)
SAMPLE_RATE = 1024