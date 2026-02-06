# Development Session Report: LucidRF ML Pipeline

**Date:** February 4, 2026
**Topic:** Dataset Standardization, Pipeline Architecture, and Metadata Schema
**Status:** Phase 2 (Data Prep) Refactoring

---

## Executive Summary

In this session, we formalized the **LucidRF** machine learning pipeline, We successfully implemented a "Master Scaling" strategy to ensure physical consistency between datasets and resolved a critical metadata inconsistency issue to ensure seamless future analysis.

We also conducted a preliminary architectural review for the upcoming modeling phase, weighing the trade-offs between Standard Autoencoders and U-Nets for RF signal denoising.

---

## Accomplishments

### Data Standardization (Physics Calibration)

We implemented a **Global Master Scaling** strategy to ensure the future model receives physically consistent data.

- **The Logic:** Instead of normalizing each file locally (which destroys relative power differences), we now calculate a single global maximum across _all_ datasets (Barrage, Spot, etc.).
- **Implementation:** Created **Notebook 22 (`dataset_standardization.ipynb`)**.
- **Outcome:** Both datasets are now scaled to the `[-1, 1]` range relative to the loudest signal in the entire project.
- **Proof:** Generated a standardized density plot (optimized with random sampling to prevent editor crashes) confirming the distribution is safe for training.

### Metadata Schema Unification

We identified a flaw where Barrage and Spot datasets used different metadata columns. We designed a **Unified Schema** to ensure traceability for the final "Project Book."

**The Gold Standard Schema:**

| Column              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `global_index`      | Unique ID for mapping back to `.npy` arrays.             |
| `sinr_db`           | Signal-to-Noise Ratio (Difficulty).                      |
| `clean_frame_id`    | D reference to the original clean signal.                |
| `noise_frame_id`    | ID reference to the specific noise sample used.          |
| `interference_type` | The **Class** (e.g., "Barrage", "Spot").                 |
| `source`            | The **Instance** (e.g., "AWGN_Generator", "EMISignal1"). |

---

## Architectural Discussion: Model Selection

We evaluated two potential architectures for the interference removal task. While a final decision is pending, the U-Net architecture is currently the leading candidate.

### Option A: Standard Autoencoder

- **Mechanism:** Compresses the input signal into a tiny "bottleneck" (Latent Space) and reconstructs it.
- **Pros:** Simpler architecture, faster training, excellent at removing unstructured noise (AWGN).
- **Cons:** The bottleneck often leads to a loss of fine detail. In RF terms, this can manifest as "phase smoothing," where the reconstructed signal looks clean but has lost the precise timing required for high-order modulation (e.g., 64-QAM).

### Option B: 1D U-Net (Leading Candidate)

- **Mechanism:** An Autoencoder augmented with **Skip Connections** that pass the original high-resolution signal directly to the output layers .
- **Pros:**
- **Phase Integrity:** Skip connections allow the model to preserve the exact phase and timing of the original signal by "subtracting" noise rather than rebuilding the signal from scratch.
- **Localization:** Superior at handling Spot and Pulsed jamming because it preserves spatial (temporal) context better than a bottleneck-only model.

- **Cons:** More computationally expensive and complex to implement.
