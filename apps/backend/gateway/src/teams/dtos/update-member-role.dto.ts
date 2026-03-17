import { TeamRole, UpdateMemberRoleRequest } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMemberRoleDto implements UpdateMemberRoleRequest {
  /**
   * New role to assign to the team member
   */
  @IsNotEmpty()
  @IsEnum(TeamRole)
  role!: TeamRole;
}
