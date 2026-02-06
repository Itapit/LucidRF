# Machine A Complete Analysis & Handoff Report

**Date:** February 5, 2026  
**Purpose:** Comprehensive documentation of Machine A (Logistic Regression Jamming Detector) for pipeline continuity to Machine B (Autoencoder Denoiser)

---

## 1. Executive Summary

Machine A is a **binary classifier** that detects the presence of RF jamming/interference in a signal chunk. It serves as the **gatekeeper** in our two-stage pipeline:

```
┌─────────────────┐        ┌─────────────────┐
│   Machine A     │  YES   │   Machine B     │
│  (Detection)    │ ────▶  │  (Mitigation)   │
│                 │        │                 │
│ "Is this jammed?"│        │ "Remove the jam" │
└─────────────────┘        └─────────────────┘
         │
         │ NO
         ▼
    Pass Through
    (Clean Signal)
```

**Key Achievements:**

- ✅ AUC: **0.962** (Excellent discriminator)
- ✅ Precision: **96%** (Low false alarm rate)
- ✅ Recall: **87%** (Misses only low-power interference below noise floor)
- ✅ Physics-aware: Learns spectral shape, not just power

---

## 2. Dataset: JamShield (Real Hardware Data)

### 2.1 Source

- **Dataset:** JamShield IQ recordings
- **Hardware:** USRP X310 Software Defined Radio
- **Sample Rate:** 1 MHz (1,000,000 samples/second)
- **Format:** Raw `.mat` files converted to `.npy`

### 2.2 Classes

| Label | Class   | Description                                     |
| ----- | ------- | ----------------------------------------------- |
| 0     | Clean   | Normal WiFi/OFDM transmission (no interference) |
| 1     | Jamming | Signal corrupted by interference                |

### 2.3 Jamming Types in Dataset

| Type                    | CSV Name | Physical Behavior                          |
| ----------------------- | -------- | ------------------------------------------ |
| Barrage (Gaussian)      | `Gauss`  | Broadband noise filling entire spectrum    |
| Narrowband (Sinusoidal) | `Sin`    | Continuous wave (CW) at specific frequency |

### 2.4 Metadata Fields

Each sample includes:

- `filename`: Source file (e.g., `w1_barrage.npy`)
- `jamming_power`: Relative power level (0.1, 0.3, 0.6, 1.0)
- `distance`: Physical distance from jammer
- `jammer_type`: `Gauss`, `Sin`, or `No`

### 2.5 Data Splits

| Split      | Purpose                     | Size | % of Total |
| ---------- | --------------------------- | ---- | ---------- |
| Train      | Model fitting               | ~70% | 70%        |
| Validation | Hyperparameter tuning       | ~15% | 15%        |
| Test       | Final evaluation (held out) | ~15% | 15%        |

**Class Balance:** ~33% Clean, ~67% Jamming (handled via `class_weight='balanced'`)

---

## 3. Feature Engineering

### 3.1 Chunk/Frame Size

```python
CHUNK_SIZE = 10_000  # samples
# At 1 MHz sample rate = 10 ms duration per chunk
```

**Rationale:** 10ms provides sufficient statistical moments while maintaining time stationarity.

### 3.2 Active Features (5 Total)

| Feature               | Formula/Method                     | Physical Meaning            | Jamming Indicator                               |
| --------------------- | ---------------------------------- | --------------------------- | ----------------------------------------------- |
| **Spectral Flatness** | `gmean(PSD) / mean(PSD)`           | 0=Tonal, 1=White Noise      | HIGH = Barrage jamming (flat spectrum)          |
| **PAPR**              | `10*log10(max(power)/mean(power))` | Peak-to-Average Power Ratio | Jammers often have constant envelope (low PAPR) |
| **Kurtosis**          | `scipy.stats.kurtosis(magnitude)`  | Tail heaviness (Gaussian=0) | Non-Gaussian indicates interference             |
| **Skewness**          | `scipy.stats.skew(magnitude)`      | Distribution asymmetry      | Asymmetric distributions indicate corruption    |
| **Mean Power**        | `mean(power)`                      | Average signal energy       | Secondary indicator (loud ≠ always jammed)      |

### 3.3 Excluded Features (Correlated)

```python
# 'Variance'         # Highly correlated with Mean Power
# 'Spectral Entropy' # Highly correlated with Spectral Flatness
```

### 3.4 Feature Computation Code

Located in: [src/features.py](../src/features.py)

```python
def compute_feature_vector(chunk, active_features):
    """
    Computes only the features listed in active_features.
    Optimized: magnitude/power computed once per chunk.
    """
    mag = np.abs(chunk)
    power = mag ** 2

    row = {}
    for feature_name in active_features:
        func = FEATURE_MAP[feature_name]
        row[feature_name] = func(chunk, mag, power)
    return row
```

---

## 4. Model Architecture

### 4.1 Pipeline Structure

```python
pipeline = Pipeline([
    ('scaler', StandardScaler()),      # Z-score normalization
    ('log_reg', LogisticRegression(
        class_weight='balanced',       # Handle 2:1 class imbalance
        solver='lbfgs',
        max_iter=1000,
        random_state=42,
        C=<tuned>                      # Regularization strength
    ))
])
```

### 4.2 Hyperparameter Tuning

- **Method:** Grid search over C values
- **Candidates:** `[0.001, 0.01, 0.1, 1, 10, 100]`
- **Selection Metric:** F1-Score on validation set
- **Best C:** Selected via validation performance

### 4.3 Model Artifact

- **Path:** `models/machine_a_logistic_v1.pkl`
- **Format:** Joblib-serialized sklearn Pipeline
- **Contains:** Fitted StandardScaler + LogisticRegression

---

## 5. Model Interpretation: Learned Decision Logic

### 5.1 Feature Weights (Importance Ranking)

| Rank | Feature               | Weight Direction     | Interpretation                               |
| ---- | --------------------- | -------------------- | -------------------------------------------- |
| 1    | **Spectral Flatness** | Positive (→ Jamming) | Primary discriminator: flat spectrum = noise |
| 2    | **PAPR**              | Negative (→ Clean)   | High PAPR = bursty signal = likely clean     |
| 3    | **Kurtosis**          | Variable             | Non-Gaussian tails indicate interference     |
| 4    | **Mean Power**        | Lower importance     | Correctly learned: loud ≠ jammed             |
| 5    | **Skewness**          | Supplementary        | Asymmetry provides additional context        |

### 5.2 Physics Validation

The model correctly learned that:

1. **Spectral Shape > Raw Power**: A quiet barrage jammer is more dangerous than a loud clean signal
2. **Two-Key Detection System**:
   - Check 1: Is the spectrum unnaturally flat?
   - Check 2: Does the power distribution look machine-consistent?

---

## 6. Performance Metrics

### 6.1 Overall Performance

| Metric                  | Value | Interpretation                    |
| ----------------------- | ----- | --------------------------------- |
| **AUC**                 | 0.962 | Excellent discriminator (>0.9)    |
| **Accuracy**            | ~91%  | Overall correctness               |
| **Precision (Jamming)** | 96%   | 96% of alerts are true threats    |
| **Recall (Jamming)**    | 87%   | Catches 87% of all jamming        |
| **F1-Score**            | ~0.91 | Harmonic mean of precision/recall |

### 6.2 Sensitivity by Jamming Power

| Relative Power  | Detection Rate | Notes                                          |
| --------------- | -------------- | ---------------------------------------------- |
| 1.0 (Strongest) | ~99%           | Near-perfect detection                         |
| 0.6             | ~99%           | Excellent                                      |
| 0.3             | ~95%           | Very good                                      |
| 0.1 (Weakest)   | ~50-60%        | **Sensitivity Floor** - signal buried in noise |

**Key Insight:** The model fails at Power 0.1 because the interference is physically indistinguishable from thermal noise. This is **expected behavior**, not a bug.

### 6.3 Performance by Jammer Type

| Type               | Recall | Primary Feature Used |
| ------------------ | ------ | -------------------- |
| Gaussian (Barrage) | ~89%   | Spectral Flatness    |
| Sinusoidal (CW)    | ~85%   | PAPR + Kurtosis      |

---

## 7. Error Analysis

### 7.1 False Positives (Clean → Jammed)

- **Count:** ~1,530 (4% of alerts)
- **Root Cause:** Clean signals with periods of silence/idle channel
- **Feature Signature:** High Spectral Flatness (mimics barrage noise)
- **Mitigation:** Acceptable for automated systems; silence is ambiguous

### 7.2 False Negatives (Jammed → Clean)

- **Count:** ~5,952 (13% of jammers)
- **Root Cause:** Concentrated in Power 0.1 regime
- **Physics:** Low-power jammers below noise floor are mathematically invisible
- **Impact:** Minimal - these jammers are too weak to degrade BER significantly

---

## 8. File Paths & Configuration

### 8.1 Key Paths (from `config.py`)

```python
# Data
JAMSHIELD_NPY_DIR = PROCESSED_DIR / 'jamshield_npy'
MACHINE_A_CSV_DIR = PROCESSED_DIR / 'logistic_regression_machine_a'
MACHINE_A_DATASET_FILE = MACHINE_A_CSV_DIR / 'machine_a_dataset.csv'
MACHINE_A_TRAIN_SET_FILE = MACHINE_A_CSV_DIR / 'train_set.csv'
MACHINE_A_VAL_SET_FILE = MACHINE_A_CSV_DIR / 'val_set.csv'
MACHINE_A_TEST_SET_FILE = MACHINE_A_CSV_DIR / 'test_set.csv'

# Model
MACHINE_A_MODEL_FILE = MODELS_DIR / 'machine_a_logistic_v1.pkl'

# Constants
JAMSHIELD_SAMPLE_RATE = 1_000_000
CHUNK_SIZE = 10_000
```

### 8.2 Feature Configuration

```python
MACHINE_A_FEATURES = [
    'Mean Power',
    'PAPR',
    'Kurtosis',
    'Skewness',
    'Spectral Flatness'
]
```

---

## 9. Notebook Pipeline Summary

| Notebook                                  | Purpose                      | Output                                         |
| ----------------------------------------- | ---------------------------- | ---------------------------------------------- |
| `00_jamshield_analysis.ipynb`             | Explore raw JamShield data   | Understanding                                  |
| `01_verify_jamshield_mat_integrity.ipynb` | Validate .mat file integrity | Pass/Fail                                      |
| `10_mat_to_npy.ipynb`                     | Convert .mat → .npy          | `jamshield_npy/*.npy`                          |
| `11_verify_npy_integrity.ipynb`           | Validate converted files     | Pass/Fail                                      |
| `20_extract_features.ipynb`               | Compute features from raw IQ | `machine_a_dataset.csv`                        |
| `21_visualize_dataset.ipynb`              | Feature distributions & EDA  | Plots                                          |
| `22_create_splits.ipynb`                  | Train/Val/Test split         | `train_set.csv`, `val_set.csv`, `test_set.csv` |
| `23_verify_splits.ipynb`                  | Validate class balance       | Pass/Fail                                      |
| `30_train_logistic_regression.ipynb`      | Train & tune model           | `machine_a_logistic_v1.pkl`                    |
| `40_machine_a_evaluation.ipynb`           | Full evaluation suite        | Metrics, Plots, Analysis                       |

---

## 10. Integration Points for Machine B

### 10.1 Pipeline Handoff

Machine A outputs a **binary decision** per chunk:

- `0` → Clean: Pass through (no processing needed)
- `1` → Jammed: Route to Machine B for denoising

### 10.2 Inference Code Pattern

```python
import joblib
import numpy as np
from features import compute_feature_vector
from config import MACHINE_A_MODEL_FILE, MACHINE_A_FEATURES, CHUNK_SIZE

# Load model once
model = joblib.load(MACHINE_A_MODEL_FILE)

def detect_jamming(raw_iq_chunk):
    """
    Input:  Complex IQ samples (length = CHUNK_SIZE = 10,000)
    Output: 0 (Clean) or 1 (Jammed)
    """
    # Extract features
    features = compute_feature_vector(raw_iq_chunk, MACHINE_A_FEATURES)
    X = np.array([[features[f] for f in MACHINE_A_FEATURES]])

    # Predict
    return model.predict(X)[0]

def detect_jamming_proba(raw_iq_chunk):
    """Returns probability of jamming (for soft decisions)"""
    features = compute_feature_vector(raw_iq_chunk, MACHINE_A_FEATURES)
    X = np.array([[features[f] for f in MACHINE_A_FEATURES]])
    return model.predict_proba(X)[0, 1]  # P(Jamming)
```

### 10.3 Machine B Input Requirements

Based on previous reports, Machine B (Autoencoder) will need:

| Aspect  | Machine A (Detection)  | Machine B (Mitigation)              |
| ------- | ---------------------- | ----------------------------------- |
| Input   | 10,000 samples @ 1 MHz | 40,960 samples @ 25 MHz             |
| Dataset | JamShield (real)       | MIT RF Challenge (real) + Synthetic |
| Task    | Binary classification  | Signal reconstruction               |
| Output  | 0 or 1                 | Denoised IQ signal                  |

### 10.4 Known Limitations to Address in Machine B

1. **Spot vs Barrage Detection Inversion**: Machine A learned Barrage = High Flatness. MIT EMISignal1 is Spot Jamming (Low Flatness). Machine B must handle both.
2. **Power Floor**: Machine A misses Power 0.1 jammers. If these reach Machine B, it must handle gracefully.

---

## 11. Conclusions & Recommendations

### 11.1 What Machine A Achieved

1. **Scientifically Valid Detection**: Model learns physics (spectral shape) not shortcuts
2. **Operationally Robust**: 96% precision means low false alarm fatigue
3. **Computationally Efficient**: Logistic regression runs in microseconds
4. **Well-Characterized Limits**: Known sensitivity floor at Power 0.1

### 11.2 Recommendations for Machine B

1. **Trust Machine A's Routing**: If Machine A says "Clean", don't process
2. **Train on Both Jamming Types**: Use "Bilingual" dataset (Spot + Barrage)
3. **Use Probability Threshold**: Consider `predict_proba > 0.7` for high-confidence routing
4. **Handle Edge Cases**: Power 0.1 jammers may leak through - Machine B should not amplify them

---

## 12. Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    MACHINE A QUICK REFERENCE                    │
├─────────────────────────────────────────────────────────────────┤
│ Model:        Logistic Regression + StandardScaler              │
│ File:         models/machine_a_logistic_v1.pkl                  │
│ Features:     Mean Power, PAPR, Kurtosis, Skewness,             │
│               Spectral Flatness                                 │
│ Input:        10,000 complex samples (10ms @ 1MHz)              │
│ Output:       0 (Clean) or 1 (Jammed)                           │
│ AUC:          0.962                                             │
│ Precision:    96%                                               │
│ Recall:       87%                                               │
│ Sensitivity:  >95% for Power ≥ 0.3, degrades below              │
│ Inference:    ~microseconds                                     │
└─────────────────────────────────────────────────────────────────┘
```
