# LucidRF: Data Strategy & Dataset Integration Plan

**Last Updated:** February 5, 2026  
**Status:** Machine A ✅ Complete | Machine B 🔄 Data Prep Complete

---

## 1. System Architecture Overview

**LucidRF** is a two-stage RF interference detection and mitigation system:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LucidRF Pipeline                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Raw IQ Signal ──▶ [Machine A] ──▶ Clean? ──YES──▶ Pass Through       │
│                      (Detection)       │                                │
│                                        │                                │
│                                       NO                                │
│                                        │                                │
│                                        ▼                                │
│                                   [Machine B] ──▶ Cleaned Signal       │
│                                   (Correction)                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

| Stage         | Purpose                 | Model                | Dataset                      |
| ------------- | ----------------------- | -------------------- | ---------------------------- |
| **Machine A** | Detect jamming presence | Logistic Regression  | JamShield (Real Hardware)    |
| **Machine B** | Remove interference     | 1D U-Net Autoencoder | MIT RF Challenge + Synthetic |

---

## 2. Machine A: Jamming Detection (✅ Complete)

### 2.1 Dataset: JamShield

| Property        | Value                            |
| --------------- | -------------------------------- |
| **Source**      | JamShield Raw IQ Dataset         |
| **Hardware**    | USRP X310 Software Defined Radio |
| **Sample Rate** | 1 MHz                            |
| **Format**      | `.mat` → converted to `.npy`     |
| **Files**       | Scenarios `w1` through `w31`     |

### 2.2 Why JamShield?

1. **Real Hardware Artifacts**: Data collected from actual SDR hardware, not simulations
2. **Relevant Interference Types**: Includes Gaussian (Barrage) and Sinusoidal (CW) jamming
3. **Metadata Available**: Power levels, distances, and scenario labels

### 2.3 Processing Pipeline (Implemented)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Raw .mat    │───▶│  .npy Files  │───▶│   Features   │───▶│  CSV Dataset │
│  (JamShield) │    │  (Converted) │    │  Extraction  │    │  (Labeled)   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
   Notebooks:          10-11              20-21              22-23
```

### 2.4 Feature Engineering (Final Selection)

After EDA and correlation analysis, the following **5 features** were selected:

| Feature               | Physical Meaning            | Why Selected                                      |
| --------------------- | --------------------------- | ------------------------------------------------- |
| **Spectral Flatness** | 0=Tonal, 1=White Noise      | Primary discriminator for barrage jamming         |
| **PAPR**              | Peak-to-Average Power Ratio | Distinguishes bursty vs constant-envelope signals |
| **Kurtosis**          | Distribution tail heaviness | Detects non-Gaussian interference                 |
| **Skewness**          | Distribution asymmetry      | Additional statistical fingerprint                |
| **Mean Power**        | Average signal energy       | Secondary indicator (intentionally lower weight)  |

**Excluded Features (Correlated):**

- `Variance` → Highly correlated with Mean Power
- `Spectral Entropy` → Highly correlated with Spectral Flatness

### 2.5 Class Labeling

| Scenario                     | Label | Description                |
| ---------------------------- | ----- | -------------------------- |
| `*_clean.npy` / `No` jamming | 0     | Normal transmission        |
| `*_gaussian.npy` / `Gauss`   | 1     | Barrage (wideband) jamming |
| `*_sine.npy` / `Sin`         | 1     | Narrowband (CW) jamming    |

### 2.6 Data Splits

| Split      | Percentage | Purpose                             |
| ---------- | ---------- | ----------------------------------- |
| Train      | 70%        | Model fitting                       |
| Validation | 15%        | Hyperparameter tuning (C selection) |
| Test       | 15%        | Final evaluation (held out)         |

**Class Balance:** Handled via `class_weight='balanced'` in LogisticRegression

### 2.7 Final Performance

| Metric              | Value     |
| ------------------- | --------- |
| AUC                 | **0.962** |
| Precision (Jamming) | **96%**   |
| Recall (Jamming)    | **87%**   |

---

## 3. Machine B: Signal Correction (🔄 Data Prep Complete)

### 3.1 Dataset: MIT RF Challenge + Synthetic

| Property                | Value                                              |
| ----------------------- | -------------------------------------------------- |
| **Clean Signal Source** | MIT RF Challenge - `CommSignal2`                   |
| **Noise Sources**       | MIT `EMISignal1` (Spot) + Synthetic AWGN (Barrage) |
| **Sample Rate**         | 25 MHz                                             |
| **Sample Length**       | 40,960 samples per frame                           |
| **Dataset Size**        | 2,500 samples per interference type                |

### 3.2 Why MIT RF Challenge + Synthetic?

1. **Ground Truth Requirement**: Autoencoders need `{Noisy_Input, Clean_Target}` pairs

   - JamShield cannot provide clean ground truth (interference is baked in)
   - MIT provides clean signals that can be mathematically mixed

2. **Controlled SINR**: We control the exact interference level via mathematical mixing

3. **"Bilingual" Strategy**: Critical discovery from development:
   - **Barrage Jamming** → High Spectral Flatness (flat spectrum)
   - **Spot Jamming (EMISignal1)** → Low Spectral Flatness (spiky spectrum)
   - Training on only one type creates a **blind spot** for the other

### 3.3 The "Inverted Bridge" Discovery

During development, we discovered that MIT's `EMISignal1` behaves **opposite** to synthetic barrage noise:

| Interference Type            | At High Noise (-12dB SINR) | Spectral Signature     |
| ---------------------------- | -------------------------- | ---------------------- |
| **Barrage (Synthetic AWGN)** | High Spectral Flatness     | Flat "desert" spectrum |
| **Spot (MIT EMISignal1)**    | Low Spectral Flatness      | Spiky "peak" spectrum  |

**Implication:** Machine B must be trained on BOTH types to generalize properly.

### 3.4 Processing Pipeline (Implemented)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Machine B Data Generation                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  MIT CommSignal2 (Clean)                                                │
│         │                                                               │
│         ├───────────────────┬───────────────────┐                      │
│         ▼                   ▼                   ▼                      │
│   ┌──────────┐       ┌──────────┐       ┌──────────┐                   │
│   │  + AWGN  │       │ + EMI    │       │ Combine  │                   │
│   │ (Barrage)│       │ (Spot)   │       │ & Scale  │                   │
│   └──────────┘       └──────────┘       └──────────┘                   │
│         │                   │                   │                      │
│         ▼                   ▼                   ▼                      │
│   barrage_X.npy       spot_X.npy        Normalized                     │
│   barrage_Y.npy       spot_Y.npy        Datasets                       │
│                                                                         │
│   Notebooks: 10-11           20-21              22                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Signal Mixing Formula

The robust mixing engine calculates scaling dynamically per-slice:

```python
def mix_signal(clean_signal, noise_signal, target_sinr_db):
    # Measure actual power of current slices
    p_clean = np.mean(np.abs(clean_signal)**2)
    p_noise = np.mean(np.abs(noise_signal)**2)

    # Calculate scaling factor for exact SINR
    sinr_linear = 10.0 ** (target_sinr_db / 10.0)
    noise_scale = np.sqrt(p_clean / (p_noise * sinr_linear))

    # Mix: y = s + scaled_b
    mixture = clean_signal + (noise_signal * noise_scale)
    return mixture
```

**Verified Accuracy:** SINR error reduced to ~0.00 dB (from initial 1.96 dB deviation)

### 3.6 SINR Levels

Training data spans these interference intensities:

| SINR (dB) | Interpretation                             |
| --------- | ------------------------------------------ |
| -12       | Heavy interference (signal barely visible) |
| -9        | Strong interference                        |
| -6        | Moderate interference                      |
| -3        | Light interference                         |
| 0         | Equal power (signal = noise)               |
| +3        | Signal dominates                           |

### 3.7 Global Master Scaling (Normalization)

**Problem:** Local normalization per-file destroys relative power information.

**Solution:** Single global maximum across ALL datasets:

```python
GLOBAL_MAX = max(
    np.max(np.abs(X_barrage)),
    np.max(np.abs(X_spot))
)

# All data scaled to [-1, 1] relative to this single value
X_normalized = X / GLOBAL_MAX
```

**Output:** `master_scaling_factor.txt` stored for inference-time denormalization.

### 3.8 Unified Metadata Schema

All generated datasets follow this schema for traceability:

| Column              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `global_index`      | Unique ID mapping to `.npy` array index          |
| `sinr_db`           | Target Signal-to-Interference-Noise Ratio        |
| `clean_frame_id`    | Source frame ID from CommSignal2                 |
| `noise_frame_id`    | Source frame ID from noise file (-1 = synthetic) |
| `interference_type` | Class: "Barrage" or "Spot"                       |
| `source`            | Instance: "AWGN_Generator" or "EMISignal1"       |

### 3.9 Generated Artifacts

| File                               | Description                          |
| ---------------------------------- | ------------------------------------ |
| `spot_dataset_X.npy`               | Spot-jammed signals (raw)            |
| `spot_dataset_Y.npy`               | Corresponding clean signals (raw)    |
| `spot_dataset_metadata.csv`        | Sample metadata                      |
| `barrage_dataset_X.npy`            | Barrage-jammed signals (raw)         |
| `barrage_dataset_Y.npy`            | Corresponding clean signals (raw)    |
| `barrage_dataset_metadata.csv`     | Sample metadata                      |
| `Spot_dataset_X_normalized.npy`    | Globally normalized spot X           |
| `Spot_dataset_Y_normalized.npy`    | Globally normalized spot Y           |
| `Barrage_dataset_X_normalized.npy` | Globally normalized barrage X        |
| `Barrage_dataset_Y_normalized.npy` | Globally normalized barrage Y        |
| `master_scaling_factor.txt`        | Global max value for denormalization |

---

## 4. Notebook Pipeline Reference

### Machine A (Logistic Regression)

| Notebook                                  | Purpose                                |
| ----------------------------------------- | -------------------------------------- |
| `00_jamshield_analysis.ipynb`             | EDA on raw JamShield data              |
| `01_verify_jamshield_mat_integrity.ipynb` | Validate source files                  |
| `10_mat_to_npy.ipynb`                     | Convert .mat → .npy                    |
| `11_verify_npy_integrity.ipynb`           | Validate conversion                    |
| `20_extract_features.ipynb`               | Compute statistical features           |
| `21_visualize_dataset.ipynb`              | Feature distribution analysis          |
| `22_create_splits.ipynb`                  | Train/Val/Test split                   |
| `23_verify_splits.ipynb`                  | Validate class balance                 |
| `30_train_logistic_regression.ipynb`      | Train model with hyperparameter tuning |
| `40_machine_a_evaluation.ipynb`           | Full evaluation suite                  |

### Machine B (Autoencoder)

| Notebook                              | Purpose                          |
| ------------------------------------- | -------------------------------- |
| `00_mit_dataset_loader.ipynb`         | Load and inspect MIT data        |
| `10_dataset_generation_spot.ipynb`    | Generate Spot jamming dataset    |
| `11_dataset_generation_barrage.ipynb` | Generate Barrage jamming dataset |
| `20_dataset_analysis_spot.ipynb`      | Verify Spot dataset physics      |
| `21_dataset_analysis_barrage.ipynb`   | Verify Barrage dataset physics   |
| `22_dataset_standardization.ipynb`    | Global normalization             |
| `30_*` (TODO)                         | Model training                   |
| `40_*` (TODO)                         | Evaluation                       |

---

## 5. Configuration Reference

All paths and constants are centralized in `src/config.py`:

```python
# === Machine A (JamShield) ===
JAMSHIELD_SAMPLE_RATE = 1_000_000      # 1 MHz
CHUNK_SIZE = 10_000                     # 10ms frames

MACHINE_A_FEATURES = [
    'Mean Power', 'PAPR', 'Kurtosis', 'Skewness', 'Spectral Flatness'
]

# === Machine B (MIT) ===
MIT_SAMPLE_RATE = 25e6                  # 25 MHz
MIT_SAMPLE_LENGTH = 40_960              # Samples per frame
MIT_DATASET_SIZE = 2500                 # Samples per type

SINR_LEVELS = [-12, -9, -6, -3, 0, 3]   # dB
```

---

## 6. Key Learnings & Decisions

### ✅ Validated Decisions

1. **Real Hardware for Detection**: JamShield provides realistic artifacts that synthetic data cannot replicate
2. **Ground Truth for Reconstruction**: MIT's separated signals enable proper autoencoder training
3. **Feature Selection**: EDA confirmed Spectral Flatness as primary discriminator
4. **Dynamic Power Mixing**: Per-slice power calculation ensures accurate SINR control

### 🔄 Architectural Pivots

1. **"Bilingual" Training**: Originally planned single-noise-source; pivoted to Spot+Barrage after discovering inverted spectral behavior
2. **Global Scaling**: Local normalization was destroying power relationships; implemented master scaling factor

### ⚠️ Known Limitations

1. **Machine A Sensitivity Floor**: Detection degrades below Power 0.1 (physically below noise floor)
2. **Sample Rate Mismatch**: JamShield (1 MHz) vs MIT (25 MHz) - models trained on different time scales
3. **Domain Gap**: Machine A trained on JamShield; Machine B trained on MIT - requires careful integration testing

---

## 7. Next Steps for Machine B

1. **Architecture Selection**: 1D U-Net (leading candidate) vs Standard Autoencoder
2. **Training Pipeline**: Implement notebooks 30-39
3. **Evaluation Suite**: Implement notebooks 40-49
4. **Integration Testing**: End-to-end pipeline with Machine A routing
