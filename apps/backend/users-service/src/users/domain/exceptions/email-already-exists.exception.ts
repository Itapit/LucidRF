import { BaseDomainException } from '@LucidRF/backend-common';
import { UserErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class EmailAlreadyExistsException extends BaseDomainException {
  constructor(email: string) {
    super(`Email '${email}' is already registered`, HttpStatus.CONFLICT, UserErrorCodes.EMAIL_ALREADY_EXISTS);
  }
}
