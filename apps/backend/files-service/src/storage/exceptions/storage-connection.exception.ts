import { BaseDomainException } from '@LucidRF/backend-common';
import { FilesErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class StorageConnectionException extends BaseDomainException {
  constructor(provider: string, originalError: string) {
    super(
      `Could not connect to storage provider (${provider}): ${originalError}`,
      HttpStatus.SERVICE_UNAVAILABLE,
      FilesErrorCodes.STORAGE_CONNECTION_ERROR
    );
  }
}
