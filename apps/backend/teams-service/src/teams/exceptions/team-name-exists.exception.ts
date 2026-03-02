import { BaseDomainException } from '@LucidRF/backend-common';
import { TeamErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class TeamNameExistsException extends BaseDomainException {
  constructor(name: string) {
    super(`Team name '${name}' is already taken`, HttpStatus.CONFLICT, TeamErrorCodes.TEAM_NAME_EXISTS);
  }
}
