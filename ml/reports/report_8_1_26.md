# Engineering Session Report: Refactoring & EDA Strategy

**Project:** LucidRF - RF Signal Detection Pipeline
**Date:** Thursday, January 8, 2026
**Time:** 18:13 PM IST

---

## 1. Executive Summary

The goal of this session was to transform experimental Jupyter Notebooks into a better structured pipeline. We successfully decoupled logic from presentation, corrected critical physical assumptions about the dataset (Sample Rate), and scientifically validated our feature selection strategy. The system is now ready for the model training phase.

## 2. Architecture & Code Refactoring

We transitioned from monolithic notebooks to a modular `src/` architecture to improve maintainability and testability.

### A. Modularization (Flat `src/` Structure)

- **Feature Extraction (`src/features.py`):**
- Isolated mathematical logic for signal processing.
- Implemented optimized routines for `PAPR`, `Kurtosis`, `Spectral Flatness`, etc.
- _Benefit:_ Ensures feature definitions are identical during both Training and Inference.

- **Analysis Logic (`src/analysis.py`):**
- Moved complex evaluation loops out of the notebook.
- Created `calc_vif()` for multicollinearity checks.
- Created `run_ablation_study()` to perform pure mathematical evaluation of feature sets.

- **Plotting Engine (`src/plotting.py`):**
- Centralized visual settings.
- Created `setup_plotting_style()` to enforce a global theme (Whitegrid, Deep Palette, Font Scale 1.2).
- Updated `save_plot()` with a global toggle (`SAVE_FIGURES`) to prevent disk clutter during debugging.

### B. Configuration Management (`src/config.py`)

- **Centralized Physics:** Moved "Magic Numbers" to a single source of truth.
- Defined `JAMSHIELD_SAMPLE_RATE = 1_000_000` (1 Msps).
- Defined `CHUNK_SIZE = 10_000` samples.

- **Feature Contract:** Defined `MACHINE_A_FEATURES` globally. This acts as the API contract between the extraction pipeline and the model training pipeline.

---

## 3. Data Engineering Improvements

### A. Physics Correction (Critical)

- **Discovery:** We identified that the initial assumption of **25 Msps** (standard USRP settings) was incorrect for this specific dataset.
- **Correction:** Confirmed the actual sample rate is **1 Msps**.
- **Impact:**
- Window Duration changed from **0.4ms** **10ms**.
- FFT Resolution changed from **2.5 kHz** **100 Hz** (High precision).
- _Action:_ Updated `config.py` to propagate this change globally.

### B. Metadata Translation strategy

- **Challenge:** Filenames (`w1_barrage`) did not match Metadata CSV entries (`Gauss`).
- **Solution:** Built translation helper in `20_extract_features.ipynb` that:

1. Parses the filename.
2. Maps vocabulary (`barrage` `Gauss`, `sine` `Sin`).
3. Performs O(1) dictionary lookups to retrieve Jamming Power and Distance.

---

## 4. Data Science & Analysis Decisions

### A. Feature Selection (VIF Analysis)

- **Finding:** `Spectral Entropy` (VIF ~554) and `Variance` (VIF ~405) showed extreme multicollinearity.
- **Validation:** The **Feature Interaction Matrix** (Pair Plot) showed a near-perfect curvilinear relationship between Entropy and Flatness.
- **Decision:** Removed both features to improve model stability.
- **Final Set:** `Mean Power`, `PAPR`, `Kurtosis`, `Skewness`, `Spectral Flatness`.

### B. Scaler Selection

- **Experiment:** Comparison of `StandardScaler` vs. `MinMaxScaler`.
- **Result:** Performance difference was negligible (< 0.001 F1 Score).
- **Decision:** Selected **`StandardScaler`**.
- **Rationale:** It is the industry standard for Logistic Regression and is more robust to outliers in RF power data compared to MinMax scaling.

### C. Class Imbalance Strategy

- **Status:** Dataset is split 2:1 (300k Jammed vs. 150k Clean).
- **Strategy:**
- **Active:** Use `class_weight='balanced'` in all models.
- **Deferred:** SMOTE and Signal Augmentation are reserved as "Plan B" if the baseline model underperforms on recall.

---

## 5. Visualization Enhancements

### A. Visual Consistency

- **The Issue:** Early plots mixed `viridis` (Purple/Yellow) with `tab:blue` and hardcoded `red`.
- **The Fix:** Standardized on the **Matplotlib Cycle (`C0`, `C1`)**.
- `C0` (Deep Blue) = Clean / StandardScaler
- `C1` (Deep Orange) = Jammed / MinMaxScaler

- **Result:** Immediate visual clarity across all charts (Boxplots, Histograms, KDEs).

### B. Plotting Logic

- **Labels:** Fixed bar chart labels that were off-center by using `ha='center'` and dynamic coordinates.
- **Headroom:** Added dynamic Y-axis stretching (`ylim * 1.15`) to prevent text labels from overlapping with chart titles.
- **Efficiency:** Implemented sampling (`n=2000`) for the **Feature Interaction Matrix** to prevent kernel crashes during pair plot rendering.
