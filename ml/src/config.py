from pathlib import Path
import numpy as np

# -----------------------------------------------------------------
# Define project files and directories
# -----------------------------------------------------------------

# --- PROJECT STRUCTURE ---
BASE_DIR = Path(__file__).resolve().parent.parent

# reports directory
REPORTS_DIR = BASE_DIR / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"

# models directory
MODELS_DIR = BASE_DIR / "models"

# Data Directories
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / 'raw'
PROCESSED_DIR = DATA_DIR / "processed"

# JamShield Paths (Real Hardware Data)
JAMSHIELD_DIR = RAW_DATA_DIR / 'JamShield'
JAMSHIELD_RAW_DIR = JAMSHIELD_DIR / 'iq-data'
JAMSHIELD_NPY_DIR = PROCESSED_DIR / 'jamshield_npy'
JAMSHIELD_FILE_PATTERN = "w*.mat"
JAMSHIELD_METADATA_FILE = JAMSHIELD_RAW_DIR / 'metadata.csv'

# MIT Challenge Paths
MIT_DATA_DIR = RAW_DATA_DIR / 'mit-rf-challenge'


# Ensure writable directories exist
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
JAMSHIELD_NPY_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------------------------
# DATASETS & ARTIFACTS
# -----------------------------------------------------------------

# --- MACHINE A (logistic regression) PATHS ---
MACHINE_A_CSV_DIR = PROCESSED_DIR / 'logistic_regression_machine_a'
MACHINE_A_DATASET_FILE = MACHINE_A_CSV_DIR / 'machine_a_dataset.csv'
MACHINE_A_TRAIN_SET_FILE = MACHINE_A_CSV_DIR / 'train_set.csv'
MACHINE_A_VAL_SET_FILE   = MACHINE_A_CSV_DIR / 'val_set.csv'
MACHINE_A_TEST_SET_FILE  = MACHINE_A_CSV_DIR / 'test_set.csv'

MACHINE_A_MODEL_FILE = MODELS_DIR / 'machine_a_logistic_v1.pkl'

# -- machine B paths --
MIT_DATASET_PATH = RAW_DATA_DIR / 'mit-rf-challenge/dataset/interferenceset_frame'


# -- Machine B old paths --
MIT_CLEAN_FILE = MIT_DATASET_PATH / "CommSignal2_raw_data.h5"
MIT_NOISE_FILE = MIT_DATASET_PATH / "EMISignal1_raw_data.h5"
MIT_GENERATED_DATA_DIR = PROCESSED_DIR / 'mit_autoencoder_dataset'
MIT_SPOT_X = MIT_GENERATED_DATA_DIR / "spot_dataset_X.npy"
MIT_SPOT_Y = MIT_GENERATED_DATA_DIR / "spot_dataset_Y.npy"
MIT_SPOT_DATASET_METADATA_FILE = MIT_GENERATED_DATA_DIR / "spot_dataset_metadata.csv"

MIT_SPOT_X_NORMALIZED = MIT_GENERATED_DATA_DIR / "Spot_dataset_X_normalized.npy"
MIT_SPOT_Y_NORMALIZED = MIT_GENERATED_DATA_DIR / "Spot_dataset_Y_normalized.npy"

MIT_BARRAGE_X = MIT_GENERATED_DATA_DIR / "barrage_dataset_X.npy"
MIT_BARRAGE_Y = MIT_GENERATED_DATA_DIR / "barrage_dataset_Y.npy"
MIT_BARRAGE_DATASET_METADATA_FILE = MIT_GENERATED_DATA_DIR / "barrage_dataset_metadata.csv"

MIT_BARRAGE_X_NORMALIZED = MIT_GENERATED_DATA_DIR / "Barrage_dataset_X_normalized.npy"
MIT_BARRAGE_Y_NORMALIZED = MIT_GENERATED_DATA_DIR / "Barrage_dataset_Y_normalized.npy"

MACHINE_B_MODEL_FILE = MODELS_DIR / 'lucidrf_unet_checkpoint.pth'


# --- Machine B (U-net) new PATHS ---

UNET_PROCESSED_DATA_DIR = PROCESSED_DIR / 'U-net_dataset'


STAGE_RAW = "01_raw"
STAGE_CLEANED = "02_cleaned"
STAGE_SPLIT = "03_split"
STAGE_AUGMENTED = "04_augmented"
STAGE_MIXED = "05_mixed"
STAGE_SCALED = "06_scaled"
STAGE_FINAL = "07_final"

STAGES = [
    STAGE_RAW, STAGE_CLEANED, STAGE_SPLIT, 
    STAGE_AUGMENTED, STAGE_MIXED, STAGE_SCALED, STAGE_FINAL
]

TRAIN = "train"
VAL = "val"
TEST = "test"

SPLITS = [TRAIN, VAL, TEST]

EMISignal1 = "EMISignal1"
CommSignal2 = "CommSignal2"
CommSignal3 = "CommSignal3"
CommSignal5G1 = "CommSignal5G1"
BarrageSignal = "BarrageSignal"

MIXED_DATASET = "mixed_dataset"
MIXED_METADATA = "mixed_metadata"
SCALING_FACTORS_FILE = UNET_PROCESSED_DATA_DIR / "scaling_factors.txt"


SIGNALS = [EMISignal1, CommSignal2, CommSignal3, CommSignal5G1, BarrageSignal   ]

SUBFOLDERS = {
    STAGE_SPLIT: SPLITS,
    STAGE_AUGMENTED: [TRAIN], # Only augment training data
    STAGE_MIXED: SPLITS,
    STAGE_SCALED: SPLITS,
    STAGE_FINAL: SPLITS
}

for stage in STAGES:
    stage_path = UNET_PROCESSED_DATA_DIR / stage
    if stage in SUBFOLDERS:
        for sub in SUBFOLDERS[stage]:
            (stage_path / sub).mkdir(parents=True, exist_ok=True)
    else:
        stage_path.mkdir(parents=True, exist_ok=True)


def get_unet_path(stage, split=None, signal=None, extension="npy"):
    """
    Returns the Path object for a specific file in the pipeline.
    Usage: get_unet_path(STAGE_SPLIT, split="train", signal=CommSignal2)
    """
    path = UNET_PROCESSED_DATA_DIR / stage
    
    # Add split subfolder if provided (e.g., /train/)
    if split:
        path = path / split
        
    # If a signal name is provided, return the file path
    # Otherwise, return the directory path
    if signal:
        return path / f"{signal}.{extension}"
    
    return path

# -----------------------------------------------------------------
# Define PHYSICS & SIGNAL CONSTANTS
# -----------------------------------------------------------------

# JamShield Dataset (USRP X310)
# Spec: 1 Msps Sampling Rate
JAMSHIELD_SAMPLE_RATE = 1_000_000

# This controls FFT resolution and time stationarity (frame size).
# 10,000 samples @ 1Msps = 10ms duration
CHUNK_SIZE = 10_000

# MIT RF Challenge Dataset
# Spec: 25 MHz (per the provided documentation)
MIT_SAMPLE_RATE = 25e6

# This is the size of the "chunk" (or frame) we cut out of the recording to feed into the model.
MIT_SAMPLE_LENGTH = 40_960

# this is the amount of data to generate for the MIT autoencoder dataset
MIT_DATASET_SIZE = 12500

MIT_SINR_MIN_DB = -18.0
MIT_SINR_MAX_DB = 20.0

# -----------------------------------------------------------------
# Define Feature and Experiment Settings 
# -----------------------------------------------------------------

# --- FEATURE DEFINITIONS ---
MACHINE_A_FEATURES = ['Mean Power', 
                      'PAPR', 
                      'Kurtosis',
                      # 'Variance', # correlated with Mean Power
                      'Skewness',
                      'Spectral Flatness',
                      # 'Spectral Entropy' # correlated with Spectral Flatness
                      ]


# -----------------------------------------------------------------
# toggles
# -----------------------------------------------------------------
SAVE_FIGURES = False