# Session Summary: LucidRF Denoising Pipeline - 2026-02-09

## Major Milestones

### 1. Architecture Implementation (1D U-Net)

- Implemented a 1D U-Net in PyTorch for RF signal denoising.
- **Encoder:** 4-stage downsampling using `DoubleConv` (Conv1d-BN-ReLU x2) and `MaxPool1d`. Channel depth increases from 16 to 256.
- **Decoder:** 4-stage upsampling using `ConvTranspose1d` with concatenation skip connections to preserve high-frequency signal details.
- **Input/Output:** Processes I/Q data as 2-channel tensors `(Batch, 2, 40960)`. Output maps to `(Batch, 2, 40960)` for reconstruction.

### 2. Environment Migration & Optimization

- Migrated training environment from local Laptop CPU to Kaggle (Tesla P100 GPU).
- **Throughput Increase:** Achieved ~134 samples/sec (Batch 32) vs 6.4 samples/sec (Batch 4).
- **Configuration Adjustments:**
- Enabled `pin_memory=True` for CUDA data transfer.
- Disabled `torch.compile` due to `GPUTooOldForTriton` error on Pascal architecture (Compute Capability 6.0).

### 3. Dataset Generation Pipeline (Scaled to 25k)

- Scaled dataset from 5,000 to 25,000 samples (12,500 Spot, 12,500 Barrage).
- **SINR Distribution:** Shifted from discrete steps (`[-12, -9, ..., 3]`) to a continuous uniform distribution (`Uniform(-18, 20)` dB) to improve model generalization and prevent quantization overfitting.
- **Memory Optimization:**
- Replaced in-memory list appending with `numpy.lib.format.open_memmap` for direct-to-disk writing.
- Implemented batched processing (Batch Size: 1000) with explicit `gc.collect()` to maintain low RAM footprint (<2GB).
- Enforced `complex64` / `float32` types for noise generation, reducing memory usage by 50% compared to default `float64`.

## Key Learnings & Insights

### Memory Management in Python

- **List Overhead:** Appending large numpy arrays to Python lists causes significant memory fragmentation and overhead (observed ~16GB spike for 8GB raw data).
- **Memmap Efficiency:** `np.memmap` (and specifically `open_memmap` for valid `.npy` headers) allows writing datasets larger than physical RAM by mapping virtual memory directly to disk sectors.
- **Lazy Loading:** `h5py` files must be accessed via pointers (`f['dataset']`) rather than full reads (`f['dataset'][:]`) when inputs exceed available RAM.

### Hardware Constraints

- **Pascal GPU Limitations:** The Tesla P100 (Pascal) lacks hardware support for Triton, rendering PyTorch 2.0's `torch.compile` optimization unusable.
- **Analysis Bottlenecks:** Loading 25,000 high-dimensional samples (`25000 x 40960`) for post-generation analysis causes OOM errors. Random subset sampling () with `mmap_mode='r'` provides statistically significant visualization without loading the full dataset.

## Design Decisions

### Data Storage & Format

- **Format:** `.npy` (Numpy Binary) chosen for training data.
- **Complex Handling:** Raw data stored as `complex64`. Converted to `(2, Length)` float32 tensors in `__getitem__` to accommodate PyTorch's lack of native complex convolution support in older versions/specific layers.

### Signal Processing Logic

- **Mixing Logic:** Implemented dynamic noise scaling based on calculated signal power () rather than assuming unit power.
- Formula: .

- **Barrage vs. Spot:** Differentiated by Spectral Flatness Measure (SFM). Barrage jamming generated via AWGN (High SFM), Spot jamming via shifted interference (Low SFM).

### Training Strategy

- **Loss Function:** MSE Loss selected for pixel-wise (sample-wise) reconstruction accuracy.
- **Metric:** SINR (dB) used as the primary evaluation metric over raw loss, as it correlates directly with RF signal quality.
- **Regularization:** Implemented Early Stopping (`patience=5`) and `ReduceLROnPlateau` to prevent overfitting on the synthetic dataset.
