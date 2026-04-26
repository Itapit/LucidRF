import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FileUploadedEvent, FileStatus, SdrFileExtension } from '@LucidRF/common';
import { FileRepository } from '../domain/interfaces/file.repository.interface';
import { MlInferenceService } from '../../integrations/ml-inference/ml-inference.service';

@Injectable()
export class FileProcessorService {
  private readonly logger = new Logger(FileProcessorService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly mlInferenceService: MlInferenceService,
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
