import { BaseDomainException } from '@LucidRF/backend-common';
import { FilesErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class StorageDeleteException extends BaseDomainException {
  constructor(key: string, originalError: string) {
    super(
      `Failed to delete '${key}' from storage provider: ${originalError}`,
      HttpStatus.SERVICE_UNAVAILABLE,
      FilesErrorCodes.STORAGE_DELETE_FAILED
    );
  }
}
