import { BaseDomainException } from '@LucidRF/backend-common';
import { SystemErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class TokenGenerationException extends BaseDomainException {
  constructor(reason: string) {
    super(`Token generation failed: ${reason}`, HttpStatus.INTERNAL_SERVER_ERROR, SystemErrorCodes.INTERNAL_ERROR);
  }
}
