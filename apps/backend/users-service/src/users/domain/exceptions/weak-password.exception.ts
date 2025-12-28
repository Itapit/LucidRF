import { BaseDomainException } from '@LucidRF/backend-common';
import { UserErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class WeakPasswordException extends BaseDomainException {
  constructor(reason: string) {
    super(`Password is too weak: ${reason}`, HttpStatus.BAD_REQUEST, UserErrorCodes.WEAK_PASSWORD);
  }
}
