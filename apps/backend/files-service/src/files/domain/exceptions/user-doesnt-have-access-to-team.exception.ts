import { BaseDomainException } from '@LucidRF/backend-common';
import { FilesErrorCodes } from '@LucidRF/common';
import { HttpStatus } from '@nestjs/common';

export class UserDoesntHaveAccessToTeamException extends BaseDomainException {
  constructor(userId: string, teamId: string) {
    super(
      `User ${userId} does not have access to team ${teamId}`,
      HttpStatus.FORBIDDEN,
      FilesErrorCodes.USER_DOES_NOT_HAVE_ACCESS_TO_TEAM
    );
  }
}
