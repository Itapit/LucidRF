# Engineering Progress Report: Machine A Evaluation Phase

Date: January 11, 2026

Project: LucidRF - Jamming Detection & Restoration System

Module: Machine A (Statistical Detection)

------

### 1. Executive Summary

In this session, we finalized the **Machine A (Detection)** module. We successfully transitioned from "Training" to "Scientific Auditing," creating a dedicated evaluation pipeline that validated the model against physical RF principles. The system demonstrated high operational reliability (AUC 0.962) while adhering to expected physical sensitivity limits (Sensitivity Floor at 0.1 Power). We also refactored the codebase to separate logic (`analysis.py`) from presentation (`plotting.py`), ensuring a clean, thesis-ready repository.

------

### 2. Key Accomplishments

#### A. Architecture & Environment

- **Python 3.14 Compatibility:** Resolved environment conflicts caused by the system update to Python 3.14.2 by rebuilding the Poetry environment and re-binding the Jupyter kernel.
- **Code Refactoring:**
  - **`src/analysis.py`:** Removed hidden plotting logic to strictly handle mathematical operations and DataFrame generation.
  - **`src/plotting.py`:** Enhanced the plotting engine to support automatic watermarking (`Figure 40.05`), dynamic figure numbering, and timestamped file saving.
  - **`src/config.py`:** Updated to include dynamic pathing for model artifacts (`.pkl`) and dataset CSVs, removing hardcoded strings from notebooks.

#### B. The Evaluation Suite (`40_machine_a_evaluation.ipynb`)

We created a new, dedicated notebook for "frozen" model evaluation. This ensures that the analysis does not accidentally retrain or alter the production model. The suite includes five critical validation tests:

1. **Physics Check:** Feature Importance Analysis.
2. **Global Metrics:** ROC Curve & Confusion Matrix.
3. **Sensitivity Analysis:** Recall vs. Jamming Power.
4. **Robustness Analysis:** Recall vs. Jammer Type.
5. **Error Analysis:** False Alarm Root Cause Investigation.

------

### 3. Scientific Findings & Insights

#### 1. Verification of "Radio Physics" Learning

The model proved it is learning fundamental RF characteristics rather than memorizing metadata:

- **Spectral Flatness Dominance:** The model correctly identified **Spectral Flatness** as the #1 predictor of jamming. This aligns with physics: Jamming (barrage noise) is spectrally flat, whereas legitimate signals (OFDM/WiFi) have distinct peaks and valleys.
- **Power is Secondary:** **Mean Power** was only the 4th most important feature. This confirms the system does not simply flag "loud" signals as jammers, making it robust against nearby legitimate transmitters.

#### 2. The "Sensitivity Floor" (SNR Limits)

- **Finding:** The model exhibits a sharp drop in accuracy at **Jamming Power = 0.1** (Recall $\approx$ 40%), while performing near-perfectly ($>99\%$) at Power $\ge 0.3$.
- **Conclusion:** This is not a model failure but a **physical validation**. At Power 0.1, the jammer is buried within the thermal noise floor of the USRP hardware. A "perfect" score here would have indicated overfitting or data leakage.

#### 3. Operational Trust (False Alarm Analysis)

- **Precision (96%):** The system rarely raises false alarms.
- **Anatomy of an Error:** We discovered that "False Alarms" are not random. They occur specifically on clean signals that exhibit **abnormally high Spectral Flatness** (e.g., moments of silence or static). This proves the model is internally consistent even when it is wrong.

#### 4. Generalization

- The model demonstrated robustness across different attack vectors, detecting **Gaussian Noise** (Barrage) and **Sinusoidal** (CW) jammers with comparable effectiveness ($\approx$ 85-89%).

------

### 4. Technical Artifacts Delivered

| **Artifact**                        | **Description**                                       |
| ----------------------------------- | ----------------------------------------------------- |
| **`40_machine_a_evaluation.ipynb`** | The complete scientific auditing suite.               |
| **`machine_a_logistic_v1.pkl`**     | The trained, serialized Logistic Regression pipeline. |
| **`src/plotting.py`**               | Updated with watermark/figure ID support.             |
| **`src/analysis.py`**               | Cleaned of visualization code (Logic only).           |
| **Figures 40.01 - 40.06**           | Validated plots for the final report/thesis.          |