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

# notebook directory
NOTEBOOKS_DIR = BASE_DIR / "notebooks"

# Data Directories
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / 'raw'
PROCESSED_DIR = DATA_DIR / "processed"

# JamShield Paths (Real Hardware Data)
JAMSHIELD_DIR = RAW_DATA_DIR / 'JamShield'
JAMSHIELD_RAW_DIR = RAW_DATA_DIR / JAMSHIELD_DIR / 'iq-data'
JAMSHIELD_NPY_DIR = PROCESSED_DIR / 'jamshield_npy'
JAMSHIELD_FILE_PATTERN = "w*.mat"
JAMSHIELD_METADATA_FILE = RAW_DATA_DIR / JAMSHIELD_RAW_DIR / 'metadata.csv'

# Simulated Paths (Zero Noise / Perfect Data)
SDR_CAPTURES_DIR = RAW_DATA_DIR / 'sdr_captures'

# MIT Challenge Paths
MIT_DATA_DIR = RAW_DATA_DIR / 'mit-rf-challenge'


# Ensure writable directories exist
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
JAMSHIELD_NPY_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

# --- MACHINE A (Detection) PATHS ---
# The CSV dataset we will generate
MACHINE_A_DATASET_FILE = PROCESSED_DIR / 'machine_a_dataset.csv'


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

# SDR Captures
SIMULATION_SAMPLE_RATE = 100e6
SIMULATION_DTYPE = np.float32

# -----------------------------------------------------------------
# Define Feature and Experiment Settings 
# -----------------------------------------------------------------

# --- FEATURE DEFINITIONS ---
MACHINE_A_FEATURES = ['Mean Power', 
                      'PAPR', 
                      'Kurtosis',
                      'Variance', # correlated with Mean Power
                      'Skewness',
                      'Spectral Flatness',
                      'Spectral Entropy' # correlated with Spectral Flatness
                      ]


# -----------------------------------------------------------------
# toggles
# -----------------------------------------------------------------
SAVE_FIGURES = True