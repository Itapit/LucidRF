import { BaseDomainException } from '@LucidRF/backend-common';
import { AuthErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends BaseDomainException {
  constructor(message = 'Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED, AuthErrorCodes.UNAUTHORIZED);
  }
}
