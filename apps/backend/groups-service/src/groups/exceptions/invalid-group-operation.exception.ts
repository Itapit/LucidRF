import { BaseDomainException } from '@LucidRF/backend-common';
import { GroupErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class InvalidGroupOperationException extends BaseDomainException {
  constructor(reason: string) {
    super(`Invalid operation: ${reason}`, HttpStatus.BAD_REQUEST, GroupErrorCodes.GROUP_OPERATION_FAILED);
  }
}
