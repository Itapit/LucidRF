import { IsResourceId } from '@LucidRF/backend-common';
import { AddMemberRequest, TeamRole } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class AddMemberDto implements AddMemberRequest {
  @IsNotEmpty()
  @IsResourceId()
  targetUserId: string;

  @IsNotEmpty()
  @IsEnum(TeamRole)
  role: TeamRole;
}
