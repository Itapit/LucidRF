import torch
from torch.utils.data import Dataset
import numpy as np

class LucidRFDataset(Dataset):
    """
    PyTorch Dataset for LucidRF Denoising Task.
    
    Reads pre-split .npy tensors.
    Expected Input Shape: (N, 2, 40960) float32
    """
    def __init__(self, x_path, y_path):
        """
        Args:
            x_path (str): Path to the Noisy input .npy file
            y_path (str): Path to the Clean target .npy file
        """
        # Load data. Using mmap_mode='r' is safer for large files, 
        self.X_data = np.load(x_path, mmap_mode='r')
        self.Y_data = np.load(y_path, mmap_mode='r')
        
        # Verify alignment
        assert self.X_data.shape[0] == self.Y_data.shape[0], \
            f"Size Mismatch! X: {self.X_data.shape}, Y: {self.Y_data.shape}"


    def __len__(self):
        return self.X_data.shape[0]

    def __getitem__(self, idx):
        # Get raw samples
        # Shape expected: (2, 40960) or (40960,) complex depending on your save format
        x_sample = np.array(self.X_data[idx])
        y_sample = np.array(self.Y_data[idx])

        x_tensor = torch.from_numpy(x_sample).float()
        y_tensor = torch.from_numpy(y_sample).float()

        return x_tensor, y_tensor