import { BaseDomainException } from '@LucidRF/backend-common';
import { AuthErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends BaseDomainException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED, AuthErrorCodes.INVALID_CREDENTIALS);
  }
}
