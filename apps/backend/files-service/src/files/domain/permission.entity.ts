import { PermissionRole, PermissionType } from '@limbo/common';

export class Permission {
  subjectId: string;
  subjectType: PermissionType;
  role: PermissionRole;

  constructor(partial: Partial<Permission>) {
    Object.assign(this, partial);
  }
}
