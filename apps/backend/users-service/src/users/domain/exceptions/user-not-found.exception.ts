import { BaseDomainException } from '@LucidRF/backend-common';
import { UserErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends BaseDomainException {
  constructor(identifier: string) {
    super(`User with identifier '${identifier}' not found`, HttpStatus.NOT_FOUND, UserErrorCodes.USER_NOT_FOUND);
  }
}
