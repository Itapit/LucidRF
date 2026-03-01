import { IsResourceId } from '@LucidRF/backend-common';
import { TeamRole } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class AddMemberPayload {
  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

  @IsNotEmpty()
  @IsResourceId()
  targetUserId!: string; // The user being added

  @IsNotEmpty()
  @IsEnum(TeamRole)
  role!: TeamRole;

  @IsNotEmpty()
  @IsResourceId()
  actorId!: string; // The user performing the action
}
