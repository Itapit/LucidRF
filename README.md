# LucidRF

**LucidRF** is an advanced platform for managing, diagnosing, and cleaning Software Defined Radio (SDR) I/Q files. It utilizes Deep Learning to automatically detect and remove "Barrage" noise interference from radio signals, restoring them to a usable state.

## 🚀 Project Overview

In the field of SDR, recordings often suffer from dynamic interference (such as jamming or environmental noise) that traditional DSP filters cannot easily remove. LucidRF solves this using a two-stage AI pipeline:

1. **Detection:** A Logistic Regression model detects if a file contains "Barrage" noise.
2. **Correction:** A Denoising Autoencoder (DAE) reconstructs the original signal from the noisy input.

The platform provides a secure web interface for users to upload, manage, and share these massive binary files efficiently.

## 🏗️ Architecture

The system is built as a Monorepo using **Nx** and follows a **Microservices** architecture:

### Backend (NestJS)

- **API Gateway**: The centralized entry point handling Authentication (JWT/Passport), Authorization (RBAC), and routing requests to microservices.
- **Users Service**: Manages user identities, roles, and authentication logic via TCP transport.
- **Groups Service**: Handles user groups and permission management via TCP transport.
- **Files Service**: Manages file metadata and interacts with Object Storage.

### Frontend (Angular)

- Built with **Angular**, **PrimeNG**, and **NgRx** for state management.
- Provides a responsive UI for file uploads, visualization, and system administration.

### Infrastructure

- **MongoDB**: Uses a _Database-per-Service_ approach for storing structured metadata (Users, Groups, File Info).
- **MinIO (Object Storage)**: Handles the storage of massive raw I/Q files. Implements a "Valet Key" pattern using Presigned URLs to allow direct client uploads, bypassing the API Gateway to prevent bottlenecks.
