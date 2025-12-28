import { BaseDomainException } from '@LucidRF/backend-common';
import { FilesErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class InvalidPermissionException extends BaseDomainException {
  constructor(resourceId: string) {
    super(
      `Invalid permission for resource with ID ${resourceId}`,
      HttpStatus.FORBIDDEN,
      FilesErrorCodes.INVALID_PERMISSION
    );
  }
}
