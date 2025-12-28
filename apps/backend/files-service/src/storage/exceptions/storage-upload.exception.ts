import { BaseDomainException } from '@LucidRF/backend-common';
import { FilesErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class StorageUploadException extends BaseDomainException {
  constructor(filename: string, originalError: string) {
    super(
      `Failed to upload '${filename}' to storage provider: ${originalError}`,
      HttpStatus.SERVICE_UNAVAILABLE,
      FilesErrorCodes.STORAGE_UPLOAD_FAILED
    );
  }
}
