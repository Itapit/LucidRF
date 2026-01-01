from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / 'raw'
SDR_CAPTURES_DIR = RAW_DATA_DIR / 'sdr_captures'
PROCESSED_DIR = DATA_DIR / "processed"

RAW_DATA_FILE = RAW_DATA_DIR / "GOLD_XYZ_OSC.0001_1024.hdf5"
MODELS_DIR = BASE_DIR / "models"

SPLIT_MAP_FILE = PROCESSED_DIR / "master_split_indices.npz"

# Ensure directories exist
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# --- MACHINE A (Detection) PATHS ---
MACHINE_A_TRAIN_X = PROCESSED_DIR / 'machine_a_X_train.npy'
MACHINE_A_TRAIN_Y = PROCESSED_DIR / 'machine_a_Y_train.npy'

MACHINE_A_VAL_X   = PROCESSED_DIR / 'machine_a_X_val.npy'
MACHINE_A_VAL_Y   = PROCESSED_DIR / 'machine_a_Y_val.npy'

MACHINE_A_TEST_X  = PROCESSED_DIR / 'machine_a_X_test.npy'
MACHINE_A_TEST_Y  = PROCESSED_DIR / 'machine_a_Y_test.npy'

# --- FEATURE DEFINITIONS ---
MACHINE_A_FEATURES = ['Mean Power', 'PAPR', 'Kurtosis']


# Shared Constants (e.g., Sampling Rate, Feature Names)
SAMPLE_RATE = 1024

# --- EXPERIMENT SETTINGS ---
NOISE_POWER_DB = -25.0