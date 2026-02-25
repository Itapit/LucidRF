import torch
import torch.nn as nn
import torch.nn.functional as F

class DoubleConv(nn.Module):
    """
    (Conv1d => BN => ReLU) * 2
    """
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.double_conv = nn.Sequential(
            nn.Conv1d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm1d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv1d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm1d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.double_conv(x)


class LucidRF_UNet(nn.Module):
    """
    1D U-Net for RF Signal Denoising.
    """
    def __init__(self, n_channels=2, n_classes=2, base=16):
        super(LucidRF_UNet, self).__init__()
        self.n_channels = n_channels
        self.n_classes = n_classes

        # --- Encoder ---
        self.inc = DoubleConv(n_channels, base)
        self.down1 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base, base*2))
        self.down2 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base*2, base*4))
        self.down3 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base*4, base*8))
        self.down4 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base*8, base*16))

        # --- Decoder ---
        self.up1 = nn.ConvTranspose1d(base*16, base*8, kernel_size=2, stride=2)
        self.conv_up1 = DoubleConv(base*16, base*8)
        
        self.up2 = nn.ConvTranspose1d(base*8, base*4, kernel_size=2, stride=2)
        self.conv_up2 = DoubleConv(base*8, base*4)
        
        self.up3 = nn.ConvTranspose1d(base*4, base*2, kernel_size=2, stride=2)
        self.conv_up3 = DoubleConv(base*4, base*2)
        
        self.up4 = nn.ConvTranspose1d(base*2, base, kernel_size=2, stride=2)
        self.conv_up4 = DoubleConv(base*2, base)

        # --- Output ---
        self.outc = nn.Conv1d(base, n_classes, kernel_size=1)

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)

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