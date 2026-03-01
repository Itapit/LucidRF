import { BaseDomainException } from '@LucidRF/backend-common';
import { TeamErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class TeamNotFoundException extends BaseDomainException {
  constructor(teamId: string) {
    super(`Team with ID ${teamId} not found`, HttpStatus.NOT_FOUND, TeamErrorCodes.TEAM_NOT_FOUND);
  }
}
