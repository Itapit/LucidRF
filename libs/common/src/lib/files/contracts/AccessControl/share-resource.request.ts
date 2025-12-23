import { PermissionRole, PermissionType } from '../../domain/enums';

export interface ShareResourceRequest {
  resourceId: string;
  subjectId: string;
  subjectType: PermissionType;
  role: PermissionRole;
}
