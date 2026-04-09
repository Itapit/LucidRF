import { AddMemberRequest, TeamRole } from '@LucidRF/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto implements AddMemberRequest {
  /**
   * User's email address or user ID
   * @example 'member@example.com'
   */
  @IsNotEmpty()
  @IsString()
  identifier: string;

  /**
   * Initial role for the new team member
   */
  @IsNotEmpty()
  @IsEnum(TeamRole)
  role: TeamRole;
}
