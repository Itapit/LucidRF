# Session Report: Dataset Engineering & Physics Verification

**Date:** January 20, 2026

## 1. Executive Summary

The primary goal of this session was to generate a scientifically accurate training dataset for the LucidRF Autoencoder ("Machine B"). While implementing the pipeline, we uncovered a critical physical discrepancy between the provided MIT interference data (`EMISignal1`) and the detection logic of our previous system ("Machine A").

This discovery necessitated a major architectural pivot: moving from a single-source dataset to a **"Bilingual" training strategy** that incorporates both real-world "Spot Jamming" and synthetic "Barrage Jamming." We successfully implemented modular generation scripts, verified the physics of the mixing engine, and established a rigorous analysis pipeline.

---

## 2. Key Accomplishments

### A. The "Robust Mixing Engine"

We developed and verified a physics-compliant signal mixer:

- **Problem:** Previous iterations assumed all input slices had Unit Power, leading to a measured SINR deviation of **1.96 dB**.
- **Solution:** Implemented dynamic power calculation on a per-slice basis.
- Formula:

- **Result:** Reduced SINR error to **~0.00 dB**, ensuring precise control over the "harshness" of the training data.

### B. Modular Dataset Generation

We split the generation pipeline into two independent modules to support the new "Bilingual" strategy:

1. **`10_dataset_generation_spot.ipynb`:** Generates "Spot Jamming" samples using the MIT `EMISignal1` source file.
2. **`11_dataset_generation_barrage.ipynb`:** Generates "Barrage Jamming" samples using synthetic Additive White Gaussian Noise (AWGN).

---

## 3. Technical Discovery: The "Inverted Bridge"

The most significant insight of the session was the behavioral divergence of spectral features between the two jamming types.

### The Expectation

Based on Machine A (Logistic Regression), we expected "Heavy Jamming" (-12 dB) to always result in **High Spectral Flatness** (broadband noise filling the spectrum).

### The Observation

- **Barrage Jamming (Synthetic):** Followed expectations.
- High Noise (-12 dB) High Flatness ().

- **Spot Jamming (MIT):** Showed the **opposite** trend.
- High Noise (-12 dB) **Low Flatness** (Spiky).

### The Physics Explanation

The MIT `EMISignal1` data is **Narrowband Interference** (Spot Jamming), meaning it concentrates energy into a single spectral peak. When this noise dominates the signal, the spectrum becomes "spiky" (Low Flatness). Conversely, Barrage Jamming distributes energy across the band, making the spectrum "flat" (High Flatness).

### System Implication

This confirmed that our system must be trained to recognize _both_ spectral signatures. Training only on MIT data would have created a "blind spot" for broadband attacks, while training only on synthetic data would have failed against narrowband attacks.

---

## 4. Verification & Analysis

We established a reusable analysis notebook (`12_dataset_analysis_barrage.ipynb`) that performs three checks on any new dataset:

1. **Statistical Balance:** Verifies equal distribution of SINR levels (avoiding class imbalance).
2. **Physics Check:** Plots Target SINR vs. Measured SINR to detect math errors.
3. **Feature Continuity:** Plots Spectral Flatness vs. SINR to confirm the physical nature of the interference (Spot vs. Barrage).
