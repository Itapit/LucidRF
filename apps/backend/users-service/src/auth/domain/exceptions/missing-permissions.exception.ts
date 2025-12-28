import { BaseDomainException } from '@LucidRF/backend-common';
import { AuthErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class MissingPermissionsException extends BaseDomainException {
  constructor(permission: string) {
    super(`Missing required permission: ${permission}`, HttpStatus.FORBIDDEN, AuthErrorCodes.MISSING_PERMISSIONS);
  }
}
