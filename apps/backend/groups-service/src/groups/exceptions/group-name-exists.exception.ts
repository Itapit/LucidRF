import { BaseDomainException } from '@LucidRF/backend-common';
import { GroupErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class GroupNameExistsException extends BaseDomainException {
  constructor(name: string) {
    super(`Group name '${name}' is already taken`, HttpStatus.CONFLICT, GroupErrorCodes.GROUP_NAME_EXISTS);
  }
}
