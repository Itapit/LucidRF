# Notebook Numbering Convention (Lifecycle System)

This project follows the **"Grouped Decades"** numbering system. This standard ensures that notebooks appear in a logical order within the filesystem and allows for the insertion of intermediate steps without requiring a mass rename of files.

## 00-09: Exploration & Sandbox

**Focus:** Raw Data Inspection.

- Checking the integrity of initial data sources.
- Quick "sanity checks" and throwaway scripts.
- Drafting ideas before building the formal pipeline.

## 10-19: Data Processing (ETL)

**Focus:** Cleaning & formatting.

- Converting raw data formats into usable binary formats.
- Filtering, normalizing, or reshaping data.
- Preparing the "Gold Standard" raw dataset for analysis.

## 20-29: Feature Engineering & Analysis

**Focus:** Creating the "Learnable" dataset.

- Extracting mathematical features from raw signals.
- Exploratory Data Analysis (EDA) and visualization.
- Splitting data (Train/Validation/Test).
- Verifying distribution consistency and scaling.

## 30-39: Modeling & Training

**Focus:** The Learning Loop.

- Training models (e.g., Logistic Regression).
- Hyperparameter tuning and optimization.

## 40-49: Evaluation & Interpretation

**Focus:** Performance Metrics.

- Detailed error analysis and confusion matrices.
- Investigating failure cases (false positives/negatives).
- Comparing model performance across different scenarios.

## 50-59: Inference & Production

**Focus:** Real-world Simulation.

- Loading saved models to make predictions on new data.
- End-to-end pipeline simulation.
- Performance benchmarking (speed/latency).

---

## Why this system?

1. **Logical Sorting:** Filesystems sort by name; this forces the workflow step `30` (Training) to always appear after step `20` (Features).
2. **Flexibility:** It leaves "gap" numbers open. If you need to add a second feature extraction step later, you can create `24_...` without having to rename your modeling notebooks (which start at `30`).
