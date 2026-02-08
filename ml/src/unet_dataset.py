import torch
from torch.utils.data import Dataset
import numpy as np

class LucidRFDataset(Dataset):
    """
    PyTorch Dataset for LucidRF Denoising Task.
    
    Reads paired .npy files (Noisy Input -> Clean Target).
    Expected Input Shape: (N_samples, 40960) complex or (N, 2, 40960) real
    """
    def __init__(self, x_path, y_path, transform=None):
        """
        Args:
            x_path (str): Path to the normalized Noisy input .npy file (e.g., 'spot_X.npy')
            y_path (str): Path to the normalized Clean target .npy file (e.g., 'spot_Y.npy')
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        # Load data. Using mmap_mode='r' is safer for large files, 
        # but for speed on GPU training, loading into RAM is preferred if space allows.
        self.X_data = np.load(x_path, mmap_mode='r')
        self.Y_data = np.load(y_path, mmap_mode='r')
        
        # Verify alignment
        assert self.X_data.shape[0] == self.Y_data.shape[0], \
            f"Size Mismatch! X: {self.X_data.shape}, Y: {self.Y_data.shape}"

        self.transform = transform

    def __len__(self):
        return self.X_data.shape[0]

    def __getitem__(self, idx):
        # Get raw samples
        # Shape expected: (2, 40960) or (40960,) complex depending on your save format
        x_sample = np.array(self.X_data[idx])
        y_sample = np.array(self.Y_data[idx])

        # Ensure shape is (2, 40960) for the U-Net
        if np.iscomplexobj(x_sample):
             # Convert Complex (40960,) -> Real (2, 40960)
            x_sample = np.stack((x_sample.real, x_sample.imag), axis=0)
            y_sample = np.stack((y_sample.real, y_sample.imag), axis=0)
        
        # Convert to PyTorch Tensor (Float32)
        x_tensor = torch.from_numpy(x_sample).float()
        y_tensor = torch.from_numpy(y_sample).float()

        if self.transform:
            x_tensor = self.transform(x_tensor)

        return x_tensor, y_tensor