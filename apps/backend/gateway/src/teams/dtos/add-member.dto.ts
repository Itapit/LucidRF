import { AddMemberRequest, TeamRole } from '@LucidRF/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto implements AddMemberRequest {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsEnum(TeamRole)
  role: TeamRole;
}
