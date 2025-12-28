import { BaseDomainException } from '@LucidRF/backend-common';
import { UserErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class UserAlreadyActiveException extends BaseDomainException {
  constructor(userId: string) {
    super(`User ${userId} is already active`, HttpStatus.CONFLICT, UserErrorCodes.USER_ALREADY_EXISTS);
  }
}
