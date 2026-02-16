import numpy as np

def calculate_power(signal):
    """
    Calculates the average power of a complex signal.
    Formula: P = mean( |x|^2 )
    
    Args:
        signal (np.ndarray): Complex signal array (I/Q).
        
    Returns:
        float: Average power.
    """
    # Use abs() to get magnitude, then square it. 
    # This works correctly for complex numbers: (real^2 + imag^2)
    return np.mean(np.abs(signal)**2)

def mix_signals(clean_signal, interference_signal, target_sinr_db):
    """
    Mixes a clean signal with interference at a specific SINR.
    
    Math:
        SINR_linear = P_signal / P_noise_scaled
        P_noise_scaled = alpha^2 * P_noise_raw
        Therefore: alpha = sqrt( P_signal / (P_noise_raw * SINR_linear) )
        mixed = clean + (alpha * interference)
    
    Args:
        clean_signal (np.ndarray): The Signal of Interest (SoI).
        interference_signal (np.ndarray): The noise/interference source.
        target_sinr_db (float): Desired Signal-to-Interference-plus-Noise Ratio in dB.
        
    Returns:
        tuple: (mixed_signal, alpha_factor)
            - mixed_signal (np.ndarray): The combined signal.
            - alpha_factor (float): The scaling factor applied to the interference.
    """
    # Calculate raw powers
    p_clean = calculate_power(clean_signal)
    p_interference = calculate_power(interference_signal)
    
    # Safety check: avoid division by zero if interference is silent
    if p_interference == 0:
        return clean_signal, 0.0

    # Convert dB to linear ratio
    # SINR_linear = 10 ^ (dB / 10)
    sinr_linear = 10 ** (target_sinr_db / 10.0)
    
    # Calculate scaling factor (Alpha)
    # derived from: sinr_linear = p_clean / (p_interference * alpha^2)
    alpha = np.sqrt(p_clean / (p_interference * sinr_linear))
    
    # Mix
    # x_mixed = x_clean + (alpha * x_interference)
    mixed_signal = clean_signal + (alpha * interference_signal)
    
    return mixed_signal, alpha