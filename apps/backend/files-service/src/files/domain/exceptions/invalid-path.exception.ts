import { BaseDomainException } from '@LucidRF/backend-common';
import { FilesErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class InvalidPathException extends BaseDomainException {
  constructor(path: string) {
    super(`Invalid resource path or extension: ${path}`, HttpStatus.BAD_REQUEST, FilesErrorCodes.INVALID_PATH);
  }
}
