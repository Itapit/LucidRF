import { BaseDomainException } from '@LucidRF/backend-common';
import { UserErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class UsernameAlreadyExistsException extends BaseDomainException {
  constructor(username: string) {
    super(`Username '${username}' is already taken`, HttpStatus.CONFLICT, UserErrorCodes.USERNAME_ALREADY_EXISTS);
  }
}
