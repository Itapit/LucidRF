import logging
import numpy as np
import scipy.stats as stats
from scipy import signal

logger = logging.getLogger("ml_inference.metrics")

def calc_power(iq: np.ndarray) -> float:
    """Calculates the average power of an I/Q signal."""
    return float(np.mean(np.abs(iq)**2))

def calc_total_attenuation_db(p_in: float, p_out: float) -> float:
    """Calculates the total attenuation in dB given input and output powers."""
    if p_out > 0 and p_in > p_out:
        return 10 * np.log10(p_in / p_out)
    return 0.0

def calc_papr(iq: np.ndarray, p_avg: float = None) -> float:
    """Calculates the Peak-to-Average Power Ratio (PAPR) of a signal."""
    if p_avg is None:
        p_avg = calc_power(iq)
    if p_avg <= 0:
        return 0.0
    p_peak = float(np.max(np.abs(iq)**2))
    return 10 * np.log10(p_peak / p_avg)

def calc_flatness(iq: np.ndarray, fs: float = 1.0) -> float:
    """Calculates the spectral flatness of an I/Q signal using Welch's method."""
    _, psd = signal.welch(iq, fs=fs, nperseg=1024, return_onesided=False)
    psd = psd[psd > 0]
    if len(psd) == 0:
        return 0.0
    gmean = stats.gmean(psd)
    amean = float(np.mean(psd))
    if amean <= 0:
        return 0.0
    return float(gmean / amean)

def calculate_denoising_metrics(original_iq: np.ndarray, denoised_iq: np.ndarray, fs: float = 1.0) -> dict:
    """
    Calculates quality and telemetry metrics comparing the original and denoised I/Q signals.
    Expects complex arrays (e.g. complex64).
    """
    try:
        # Calculate powers once
        p_in = calc_power(original_iq)
        p_out = calc_power(denoised_iq)
        
        # Total Attenuation (dB)
        total_attenuation_db = calc_total_attenuation_db(p_in, p_out)

        # PAPR Improvement (dB)
        papr_in = calc_papr(original_iq, p_in)
        papr_out = calc_papr(denoised_iq, p_out)
        papr_improvement_db = papr_out - papr_in

        # Spectral Flatness Reduction
        flatness_in = calc_flatness(original_iq, fs)
        flatness_out = calc_flatness(denoised_iq, fs)
        flatness_reduction = flatness_in - flatness_out

        return {
            "total_attenuation_db": round(total_attenuation_db, 2),
            "papr_improvement_db": round(papr_improvement_db, 2),
            "flatness_reduction": round(flatness_reduction, 4)
        }
    except Exception as e:
        logger.error(f"Error calculating denoising metrics: {e}")
        return {
            "total_attenuation_db": 0.0,
            "papr_improvement_db": 0.0,
            "flatness_reduction": 0.0
        }

