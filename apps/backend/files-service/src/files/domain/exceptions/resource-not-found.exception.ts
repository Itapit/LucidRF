import { BaseDomainException } from '@LucidRF/backend-common';
import { FilesErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends BaseDomainException {
  constructor(resourceId: string) {
    super(`Resource with ID ${resourceId} not found`, HttpStatus.NOT_FOUND, FilesErrorCodes.RESOURCE_NOT_FOUND);
  }
}
