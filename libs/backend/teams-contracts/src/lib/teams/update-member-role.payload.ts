import { IsResourceId } from '@LucidRF/backend-common';
import { TeamRole } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMemberRolePayload {
  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

  @IsNotEmpty()
  @IsResourceId()
  actorId!: string; // User performing the action

  @IsNotEmpty()
  @IsResourceId()
  targetUserId!: string; // User whose role is being changed

  @IsNotEmpty()
  @IsEnum(TeamRole)
  role!: TeamRole;
}
