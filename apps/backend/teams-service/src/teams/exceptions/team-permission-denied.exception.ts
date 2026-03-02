import { BaseDomainException } from '@LucidRF/backend-common';
import { TeamErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class TeamPermissionDeniedException extends BaseDomainException {
  constructor(action: string) {
    super(`Permission denied: ${action}`, HttpStatus.FORBIDDEN, TeamErrorCodes.TEAM_PERMISSION_DENIED);
  }
}
