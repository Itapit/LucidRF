import { BaseDomainException } from '@LucidRF/backend-common';
import { GroupErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class GroupPermissionDeniedException extends BaseDomainException {
  constructor(action: string) {
    super(`Permission denied: ${action}`, HttpStatus.FORBIDDEN, GroupErrorCodes.GROUP_PERMISSION_DENIED);
  }
}
