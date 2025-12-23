import { PermissionRole, PermissionType } from '../enums';

export class PermissionDto {
  subjectId!: string; // User ID or Group ID
  subjectType!: PermissionType;
  role!: PermissionRole;
}
