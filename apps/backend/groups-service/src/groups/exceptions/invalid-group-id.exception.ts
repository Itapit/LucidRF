import { BaseDomainException } from '@LucidRF/backend-common';
import { AppErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class InvalidGroupIdException extends BaseDomainException {
  constructor(id: string) {
    super(`Invalid Group ID format: ${id}`, HttpStatus.BAD_REQUEST, AppErrorCodes.BAD_REQUEST);
  }
}
