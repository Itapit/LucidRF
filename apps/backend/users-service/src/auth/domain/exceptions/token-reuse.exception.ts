import { BaseDomainException } from '@LucidRF/backend-common';
import { AuthErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class TokenReuseException extends BaseDomainException {
  constructor(userId: string) {
    super(`Token reuse detected for user ${userId}`, HttpStatus.FORBIDDEN, AuthErrorCodes.TOKEN_REUSE);
  }
}
