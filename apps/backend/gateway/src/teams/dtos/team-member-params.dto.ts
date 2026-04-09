import { IsResourceId } from '@LucidRF/backend-common';
import { TeamIdParamsDto } from './team-id.dto';

export class TeamMemberParamsDto extends TeamIdParamsDto {
  /**
   * Unique ID of the team member (user)
   */
  @IsResourceId()
  targetUserId: string;
}
