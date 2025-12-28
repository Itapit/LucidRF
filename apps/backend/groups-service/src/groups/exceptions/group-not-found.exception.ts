import { BaseDomainException } from '@LucidRF/backend-common';
import { GroupErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class GroupNotFoundException extends BaseDomainException {
  constructor(groupId: string) {
    super(`Group with ID ${groupId} not found`, HttpStatus.NOT_FOUND, GroupErrorCodes.GROUP_NOT_FOUND);
  }
}
