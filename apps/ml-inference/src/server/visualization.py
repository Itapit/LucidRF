import io
import matplotlib
# Use the non-interactive Agg backend to avoid requiring an X server or GUI dependencies
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

def generate_spectrogram_comparison(noisy_iq: np.ndarray, clean_iq: np.ndarray) -> bytes:
    """
    Generates a side-by-side waterfall spectrogram image comparing noisy vs clean data.
    Returns the raw PNG bytes.
    """
    # We use a constrained layout to look nice in the frontend
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4), sharey=True)
    
    # Define parameters for the spectrogram
    # NFFT dictates the frequency resolution (vertical bins)
    # Fs=1.0 normalizes frequency since we don't know the original sample rate
    NFFT = 256
    Fs = 1.0 
    
    # Plot the noisy data (Before)
    Pxx1, freqs1, bins1, im1 = ax1.specgram(
        noisy_iq, 
        NFFT=NFFT, 
        Fs=Fs, 
        noverlap=NFFT//2, 
        cmap='viridis'
    )
    ax1.set_title('Before (Noisy)', fontsize=14)
    ax1.set_ylabel('Normalized Frequency', fontsize=10)
    ax1.set_xlabel('Time (Samples)', fontsize=10)
    
    # Plot the clean data (After)
    Pxx2, freqs2, bins2, im2 = ax2.specgram(
        clean_iq, 
        NFFT=NFFT, 
        Fs=Fs, 
        noverlap=NFFT//2, 
        cmap='viridis'
    )
    ax2.set_title('After (Denoised)', fontsize=14)
    ax2.set_xlabel('Time (Samples)', fontsize=10)
    
    plt.tight_layout()
    
    # Save the figure to a byte buffer as a PNG
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=120, bbox_inches='tight')
    plt.close(fig)
    
    # Reset buffer position to beginning
    buf.seek(0)
    return buf.read()
