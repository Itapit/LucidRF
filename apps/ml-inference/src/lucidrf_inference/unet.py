"""1D U-Net for RF denoising (architecture must match saved checkpoints)."""

from __future__ import annotations

import torch
import torch.nn as nn


class DoubleConv(nn.Module):
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.double_conv = nn.Sequential(
            nn.Conv1d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm1d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv1d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm1d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.double_conv(x)


class LucidRFUNet(nn.Module):
    """1D U-Net: input (B, 2, L), output (B, 2, L) logits (I/Q channels)."""

    def __init__(self, n_channels: int = 2, n_classes: int = 2, base: int = 16):
        super().__init__()
        self.n_channels = n_channels
        self.n_classes = n_classes

        self.inc = DoubleConv(n_channels, base)
        self.down1 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base, base * 2))
        self.down2 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base * 2, base * 4))
        self.down3 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base * 4, base * 8))
        self.down4 = nn.Sequential(nn.MaxPool1d(2), DoubleConv(base * 8, base * 16))

        self.up1 = nn.ConvTranspose1d(base * 16, base * 8, kernel_size=2, stride=2)
        self.conv_up1 = DoubleConv(base * 16, base * 8)

        self.up2 = nn.ConvTranspose1d(base * 8, base * 4, kernel_size=2, stride=2)
        self.conv_up2 = DoubleConv(base * 8, base * 4)

        self.up3 = nn.ConvTranspose1d(base * 4, base * 2, kernel_size=2, stride=2)
        self.conv_up3 = DoubleConv(base * 4, base * 2)

        self.up4 = nn.ConvTranspose1d(base * 2, base, kernel_size=2, stride=2)
        self.conv_up4 = DoubleConv(base * 2, base)

        self.outc = nn.Conv1d(base, n_classes, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)

        x = self.up1(x5)
        x = torch.cat([x4, x], dim=1)
        x = self.conv_up1(x)

        x = self.up2(x)
        x = torch.cat([x3, x], dim=1)
        x = self.conv_up2(x)

        x = self.up3(x)
        x = torch.cat([x2, x], dim=1)
        x = self.conv_up3(x)

        x = self.up4(x)
        x = torch.cat([x1, x], dim=1)
        x = self.conv_up4(x)

        return self.outc(x)
