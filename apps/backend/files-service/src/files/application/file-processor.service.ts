import { FileMetadata, FileStatus, FileUploadedEvent, isSdrFile } from '@LucidRF/common';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MlInferenceService } from '../../integrations/ml-inference/ml-inference.service';
import { StorageService } from '../../storage/interfaces/storage.service.interface';
import { FileRepository } from '../domain/interfaces/file.repository.interface';

@Injectable()
export class FileProcessorService {
  private readonly logger = new Logger(FileProcessorService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly mlInferenceService: MlInferenceService,
    private readonly storageService: StorageService
  ) {}

  @OnEvent('file.uploaded', { async: true })
  async handleFileUploadedEvent(event: FileUploadedEvent) {
    const { resourceId, originalFileName } = event.file;
    this.logger.log(`Received file.uploaded event for file ${resourceId} (${originalFileName})`);

    try {
      if (!isSdrFile(originalFileName)) {
        this.logger.log(`File ${resourceId} is not an SDR format. Marking as AVAILABLE.`);
        await this.fileRepository.updateStatus(resourceId, FileStatus.AVAILABLE);
        return;
      }

      this.logger.log(`File ${resourceId} is an SDR format. Initiating ML processing.`);
      await this.fileRepository.updateStatus(resourceId, FileStatus.PROCESSING);

      const fileEntity = await this.fileRepository.findById(resourceId);
      if (!fileEntity) {
        this.logger.error(`File entity ${resourceId} not found in database. Cannot process.`);
        return;
      }

      const inferenceResult = await this.mlInferenceService.processSdrFile(fileEntity.storageKey);

      const metadata: FileMetadata = {
        average_probability: inferenceResult.average_probability,
        denoise_applied: inferenceResult.denoise_applied,
      };

      // Create new documents for the clean file and spectrogram if they were generated
      if (inferenceResult.denoise_applied && inferenceResult.clean_storage_key && inferenceResult.spectrogram_key) {
        this.logger.log(`Creating database records for clean SDR file and spectrogram.`);
        metadata.sinr_gain_db = inferenceResult.sinr_gain_db;

        // Clean SDR File
        const cleanFileStats = await this.storageService.statObject(inferenceResult.clean_storage_key);
        const cleanFileName = `Clean_${fileEntity.originalFileName}`;

        const cleanFileEntity = await this.fileRepository.create({
          originalFileName: cleanFileName,
          teamId: fileEntity.teamId,
          size: cleanFileStats.size,
          mimeType: fileEntity.mimeType,
          status: FileStatus.AVAILABLE,
          storageKey: inferenceResult.clean_storage_key,
          bucket: fileEntity.bucket,
          parentFolderId: fileEntity.parentFolderId ?? null,
          uploadedBy: 'SYSTEM', // ML Pipeline
        });
        metadata.clean_file_id = cleanFileEntity.id;

        // Spectrogram Image
        const spectrogramStats = await this.storageService.statObject(inferenceResult.spectrogram_key);
        const spectrogramFileName = `${fileEntity.originalFileName}_Spectrogram.png`;

        const spectrogramEntity = await this.fileRepository.create({
          originalFileName: spectrogramFileName,
          teamId: fileEntity.teamId,
          size: spectrogramStats.size,
          mimeType: 'image/png',
          status: FileStatus.AVAILABLE,
          storageKey: inferenceResult.spectrogram_key,
          bucket: fileEntity.bucket,
          parentFolderId: fileEntity.parentFolderId ?? null,
          uploadedBy: 'SYSTEM', // ML Pipeline
        });
        metadata.spectrogram_file_id = spectrogramEntity.id;
      }

      this.logger.log(`ML processing completed for file ${resourceId}. Updating metadata and status.`);
      await this.fileRepository.updateMetadata(resourceId, metadata, FileStatus.AVAILABLE);
    } catch (error) {
      this.logger.error(`Error processing file ${resourceId}:`, error instanceof Error ? error.stack : String(error));
      await this.fileRepository.updateStatus(resourceId, FileStatus.FAILED);
    }
  }
}
