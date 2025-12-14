import { PermissionRole } from './permission-role.enum';
import { PermissionType } from './permission-type.enum';

export class PermissionDto {
  subjectId!: string; // User ID or Group ID
  subjectType!: PermissionType;
  role!: PermissionRole;
}
