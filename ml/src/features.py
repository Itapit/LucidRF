import numpy as np
import scipy.stats as stats

# --- Math Functions ---
# Each function receives:
#   chunk: The raw complex data
#   mag:   Pre-computed magnitude (np.abs(chunk))
#   power: Pre-computed power (mag**2)

def calc_mean_power(chunk, mag, power):
    """Average Power of the signal"""
    return np.mean(power)

def calc_papr(chunk, mag, power):
    """Peak-to-Average Power Ratio (dB)"""
    peak = np.max(power)
    avg = np.mean(power)
    if avg <= 0: return 0.0
    return 10 * np.log10(peak / avg)

def calc_kurtosis(chunk, mag, power):
    """Kurtosis (Tail heaviness). Gaussian = 0.0"""
    return stats.kurtosis(mag)

def calc_skewness(chunk, mag, power):
    """Skewness (Asymmetry)"""
    return stats.skew(mag)

def calc_variance(chunk, mag, power):
    """Variance of the complex signal"""
    return np.real(np.var(chunk))

def calc_median_mag(chunk, mag, power):
    """Median Magnitude - against impulsive outliers"""
    return np.median(mag)

# --- Spectral Features (Frequency Domain) ---

def calc_spectral_flatness(chunk, mag, power):
    """
    Wiener Entropy / Spectral Flatness.
    0.0 = Pure Sine Wave (Spiky)
    1.0 = White Noise (Flat) -> Barrage Jamming
    """
    # 1. Compute Power Spectrum Density (PSD)
    # We use a simple periodogram estimate here
    spectrum = np.abs(np.fft.fft(chunk))**2
    
    # Avoid log(0) errors
    spectrum = spectrum[spectrum > 0]
    if len(spectrum) == 0: return 0.0

    # 2. Calculate Geometric Mean
    gmean = stats.gmean(spectrum)
    
    # 3. Calculate Arithmetic Mean
    amean = np.mean(spectrum)
    
    if amean <= 0: return 0.0
    return gmean / amean

def calc_spectral_entropy(chunk, mag, power):
    """
    Shannon Entropy of the Power Spectrum.
    High Entropy = Random Noise (Jamming)
    Low Entropy = Structured Signal (Clean)
    """
    # 1. Compute PSD
    spectrum = np.abs(np.fft.fft(chunk))**2
    
    # 2. Normalize to treat as a probability distribution
    psd_norm = spectrum / np.sum(spectrum)
    
    # 3. Calculate Entropy
    return stats.entropy(psd_norm)


# --- The Registry ---
# Maps Config Strings -> Function Objects
FEATURE_MAP = {
    'Mean Power': calc_mean_power,
    'PAPR':       calc_papr,
    'Kurtosis':   calc_kurtosis,
    'Skewness':   calc_skewness,
    'Variance':   calc_variance,
    'Median Mag':        calc_median_mag,
    'Spectral Flatness': calc_spectral_flatness,
    'Spectral Entropy':  calc_spectral_entropy
}

# --- The Orchestrator ---
def compute_feature_vector(chunk, active_features):
    """
    Computes only the features listed in active_features.
    Optimized to compute magnitude/power once per chunk.
    """
    # Optimization: Pre-compute these ONCE for the whole batch
    mag = np.abs(chunk)
    power = mag ** 2
    
    row = {}
    
    for feature_name in active_features:
        if feature_name in FEATURE_MAP:
            func = FEATURE_MAP[feature_name]
            # Pass pre-computed values to save CPU
            row[feature_name] = func(chunk, mag, power)
        else:
            # Helpful error if you typo a name in config
            print(f"Warning: Feature '{feature_name}' not implemented in features.py")
            row[feature_name] = 0.0
            
    return row


def calc_sinr_db(predictions, targets):
    """
    Calculates the Signal-to-Interference-Noise Ratio (SINR) in dB.
    
    Args:
        predictions (np.array): The Denoised Signal (Batch, Length) or (Batch, 2, Length)
        targets (np.array): The Ground Truth Clean Signal
        
    Returns:
        float: The average SINR in dB across the batch.
    """
    pred_flat = predictions.reshape(predictions.shape[0], -1)
    targ_flat = targets.reshape(targets.shape[0], -1)

    # Vectorized Power Calculation (Axis 1 = across time/channels)
    signal_power = np.mean(targ_flat ** 2, axis=1)
    
    # Noise = Difference between Prediction and Target
    noise_power = np.mean((pred_flat - targ_flat) ** 2, axis=1)

    # Ratio Calculation (with epsilon for safety)
    ratio = signal_power / (noise_power + 1e-10)
    
    # Convert to dB
    sinr_db = 10 * np.log10(ratio)

    # Return scalar mean
    return float(np.mean(sinr_db))
