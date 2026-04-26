import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FileUploadedEvent, FileStatus, SdrFileExtension } from '@LucidRF/common';
import { FileRepository } from '../domain/interfaces/file.repository.interface';
import { MlInferenceService } from '../../integrations/ml-inference/ml-inference.service';
import { StorageService } from '../../storage/interfaces/storage.service.interface';

@Injectable()
export class FileProcessorService {
  private readonly logger = new Logger(FileProcessorService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly mlInferenceService: MlInferenceService,
    private readonly storageService: StorageService,
  ) {}

  @OnEvent('file.uploaded', { async: true })
  async handleFileUploadedEvent(event: FileUploadedEvent) {
    const { resourceId, originalFileName } = event.file;
    this.logger.log(`Received file.uploaded event for file ${resourceId} (${originalFileName})`);

    try {
      const isSdrFile = this.isSdrFormat(originalFileName);

      if (!isSdrFile) {
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

      const metadata = await this.mlInferenceService.processSdrFile(fileEntity.storageKey);

      // Create new documents for the clean file and spectrogram if they were generated
      if (metadata.denoise_applied && metadata.clean_storage_key && metadata.spectrogram_key) {
        this.logger.log(`Creating database records for clean SDR file and spectrogram.`);

        // Clean SDR File
        const cleanFileStats = await this.storageService.statObject(metadata.clean_storage_key);
        const cleanFileName = `Clean_${fileEntity.originalFileName}`;
        
        await this.fileRepository.create({
          originalFileName: cleanFileName,
          teamId: fileEntity.teamId,
          size: cleanFileStats.size,
          mimeType: fileEntity.mimeType,
          status: FileStatus.AVAILABLE,
          storageKey: metadata.clean_storage_key,
          bucket: fileEntity.bucket,
          parentFolderId: fileEntity.parentFolderId ?? null,
          uploadedBy: 'SYSTEM', // ML Pipeline
        });

        // Spectrogram Image
        const spectrogramStats = await this.storageService.statObject(metadata.spectrogram_key);
        const spectrogramFileName = `${fileEntity.originalFileName}_Spectrogram.png`;

        await this.fileRepository.create({
          originalFileName: spectrogramFileName,
          teamId: fileEntity.teamId,
          size: spectrogramStats.size,
          mimeType: 'image/png',
          status: FileStatus.AVAILABLE,
          storageKey: metadata.spectrogram_key,
          bucket: fileEntity.bucket,
          parentFolderId: fileEntity.parentFolderId ?? null,
          uploadedBy: 'SYSTEM', // ML Pipeline
        });
      }

      this.logger.log(`ML processing completed for file ${resourceId}. Updating metadata and status.`);
      await this.fileRepository.updateMetadata(resourceId, metadata, FileStatus.AVAILABLE);
      
    } catch (error) {
      this.logger.error(`Error processing file ${resourceId}:`, error instanceof Error ? error.stack : String(error));
      await this.fileRepository.updateStatus(resourceId, FileStatus.FAILED);
    }
  }

  private isSdrFormat(filename: string): boolean {
    const lowerFilename = filename.toLowerCase();
    return Object.values(SdrFileExtension).some(ext => lowerFilename.endsWith(ext));
  }
}
