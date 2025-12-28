import { PermissionEntity } from '../entities';
import { PermissionAction } from '../enums';

export interface BulkPermissionOperation {
  resourceId: string;
  action: PermissionAction;
  permission: PermissionEntity;
}
