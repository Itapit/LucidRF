import { IsResourceId } from '@LucidRF/backend-common';
import { TeamIdParamsDto } from './team-id.dto';

export class TeamMemberParamsDto extends TeamIdParamsDto {
  @IsResourceId()
  targetUserId: string;
}
