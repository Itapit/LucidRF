import { PermissionRole, PermissionType } from '@LucidRF/common';

export class PermissionEntity {
  subjectId: string;
  subjectType: PermissionType;
  role: PermissionRole;

  constructor(partial: Partial<PermissionEntity>) {
    Object.assign(this, partial);
  }
}
