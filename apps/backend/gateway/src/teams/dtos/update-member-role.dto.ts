import { TeamRole, UpdateMemberRoleRequest } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMemberRoleDto implements UpdateMemberRoleRequest {
  @IsNotEmpty()
  @IsEnum(TeamRole)
  role!: TeamRole;
}
