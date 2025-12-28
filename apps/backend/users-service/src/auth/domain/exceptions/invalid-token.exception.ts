import { BaseDomainException } from '@LucidRF/backend-common';
import { AuthErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class InvalidTokenException extends BaseDomainException {
  constructor(message = 'Token is invalid or expired') {
    super(message, HttpStatus.UNAUTHORIZED, AuthErrorCodes.INVALID_TOKEN);
  }
}
