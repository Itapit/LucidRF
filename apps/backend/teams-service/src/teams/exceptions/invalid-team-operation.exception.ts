import { BaseDomainException } from '@LucidRF/backend-common';
import { TeamErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class InvalidTeamOperationException extends BaseDomainException {
  constructor(reason: string) {
    super(`Invalid operation: ${reason}`, HttpStatus.BAD_REQUEST, TeamErrorCodes.TEAM_OPERATION_FAILED);
  }
}
