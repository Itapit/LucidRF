import { PermissionType } from '../../domain/enums';

export interface UnshareResourceRequest {
  resourceId: string;
  subjectId: string;
  subjectType: PermissionType;
}
