import { PermissionRole, PermissionType } from '@LucidRF/common';

export class Permission {
  subjectId: string;
  subjectType: PermissionType;
  role: PermissionRole;

  constructor(partial: Partial<Permission>) {
    Object.assign(this, partial);
  }
}
