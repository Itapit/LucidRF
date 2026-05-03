import io
import matplotlib
# Use the non-interactive Agg backend to avoid requiring an X server or GUI dependencies
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from .constants.constants import SpectrogramConstants

def generate_spectrogram_comparison(noisy_iq: np.ndarray, clean_iq: np.ndarray) -> bytes:
    """
    Generates a side-by-side waterfall spectrogram image comparing noisy vs clean data.
    Returns the raw PNG bytes.
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4), sharey=True, layout='constrained')
    
    NFFT = SpectrogramConstants.DEFAULT_NFFT
    Fs = SpectrogramConstants.DEFAULT_FS 
    
    # --- RF-Specific Parameters ---
    # 75% overlap creates the smooth time-domain waterfall typical of SDRs
    noverlap = int(NFFT * 0.75) 
    
    # Complex IQ data (baseband) needs a two-sided spectrum centered at 0 Hz
    sides = 'twosided' if np.iscomplexobj(noisy_iq) else 'default'
    
    spec_kwargs = {
        'NFFT': NFFT,
        'Fs': Fs,
        'noverlap': noverlap,
        'cmap': 'turbo', # Modern SDR standard colormap (better than viridis for RF)
        'scale': 'dB',   # RF power is always visualized in decibels
        'window': lambda x: x * np.blackman(len(x)),
        'sides': sides
    }
    
    # Plot the noisy data (Before)
    Pxx1, freqs1, bins1, im1 = ax1.specgram(noisy_iq, **spec_kwargs)
    ax1.set_title('Before (Noisy)', fontsize=14)
    ax1.set_ylabel('Normalized Frequency', fontsize=10)
    ax1.set_xlabel('Time (Samples)', fontsize=10)
    
    # --- Lock the Dynamic Range ---
    # Calculate a realistic RF dynamic range (e.g., 60 dB) based on the noisy signal's peak.
    # This prevents the background noise from looking like bright static confetti.
    p_max = 10 * np.log10(np.max(Pxx1[Pxx1 > 0]))
    vmin = p_max - 60 
    vmax = p_max
    
    # Apply the locked color limits to the noisy plot
    im1.set_clim(vmin, vmax)
    
    # Plot the clean data (After)
    Pxx2, freqs2, bins2, im2 = ax2.specgram(clean_iq, **spec_kwargs)
    ax2.set_title('After (Denoised)', fontsize=14)
    ax2.set_xlabel('Time (Samples)', fontsize=10)
    
    # Apply the EXACT SAME color limits to the clean plot for an honest comparison
    im2.set_clim(vmin, vmax)
    
    # Add a shared colorbar so the user can read the relative dB levels
    cbar = fig.colorbar(im2, ax=[ax1, ax2], orientation='vertical')
    cbar.set_label('Relative Power (dB)', fontsize=10)
    
    
    # Save the figure to a byte buffer as a PNG
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=120, bbox_inches='tight')
    plt.close(fig)
    
    # Reset buffer position to beginning
    buf.seek(0)
    return buf.read()