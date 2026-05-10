import torch
import torch.nn as nn
import torch.nn.functional as F

class DoubleConv(nn.Module):
    """
    The fundamental building block of the U-Net.
    Applies two 1D convolutions back-to-back.
    kernel_size=3 and padding=1 ensure the signal length DOES NOT change here, 
    only the number of channels changes.
    (Conv1d => BatchNorm => ReLU) * 2
    """
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.double_conv = nn.Sequential(
            nn.Conv1d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm1d(out_channels), # Normalizes data to make training faster/stable
            nn.ReLU(inplace=True), # turns all negative numbers to 0 (max(0, x)).
            nn.Conv1d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm1d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.double_conv(x)


class LucidRF_UNet(nn.Module):
    """
    1D U-Net for RF Signal Denoising.
    Input shape expected: (Batch_Size, n_channels, Sequence_Length)
    """
    def __init__(self, n_channels=2, n_classes=2, base=16):
        super(LucidRF_UNet, self).__init__()
        self.n_channels = n_channels
        self.n_classes = n_classes

        # --- Encoder ---
        # Initial block: Maps raw IQ data (2 channels: Real and Imaginary) to the base feature size.
        self.inc = DoubleConv(n_channels, base)
        
        # MaxPool1d(2) cuts the signal length in half.
        # DoubleConv doubles the feature depth.
        self.down1 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base, base*2))
        self.down2 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base*2, base*4))
        self.down3 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base*4, base*8))
        self.down4 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base*8, base*16))

        # --- Decoder ---
        # stretches the signal, doubling its length, and halves the channels.
        self.up1 = nn.ConvTranspose1d(base*16, base*8, kernel_size=2, stride=2)
        # After concatenation, we need to reduce the channels back down, so we use DoubleConv
        self.conv_up1 = DoubleConv(base*16, base*8)
        
        self.up2 = nn.ConvTranspose1d(base*8, base*4, kernel_size=2, stride=2)
        self.conv_up2 = DoubleConv(base*8, base*4)
        
        self.up3 = nn.ConvTranspose1d(base*4, base*2, kernel_size=2, stride=2)
        self.conv_up3 = DoubleConv(base*4, base*2)
        
        self.up4 = nn.ConvTranspose1d(base*2, base, kernel_size=2, stride=2)
        self.conv_up4 = DoubleConv(base*2, base)

        # --- Output ---
        # kernel_size=1 means it looks at each time step independently to make a final decision.
        self.outc = nn.Conv1d(base, n_classes, kernel_size=1)

    def forward(self, x):
        x1 = self.inc(x) # Shape: [Batch, 16, 1024] -> Save for skip connection
        x2 = self.down1(x1) # Shape: [Batch, 32, 512]  -> Save for skip connection
        x3 = self.down2(x2) # Shape: [Batch, 64, 256]  -> Save for skip connection
        x4 = self.down3(x3) # Shape: [Batch, 128, 128] -> Save for skip connection
        x5 = self.down4(x4) # Shape: [Batch, 256, 64]  (The Bottleneck)

        x = self.up1(x5)
        x = torch.cat([x4, x], dim=1) # Skip connection
        x = self.conv_up1(x)

        x = self.up2(x)
        x = torch.cat([x3, x], dim=1) # Skip connection
        x = self.conv_up2(x)

        x = self.up3(x)
        x = torch.cat([x2, x], dim=1) # Skip connection
        x = self.conv_up3(x)

        x = self.up4(x)
        x = torch.cat([x1, x], dim=1) # Skip connection
        x = self.conv_up4(x)

        logits = self.outc(x)
        return logits