import { PermissionEntity } from '../entities/permission.entity';
import { PermissionAction } from '../enums/permission-action.enum';

export interface BulkPermissionOperation {
  resourceId: string;
  action: PermissionAction;
  permission: PermissionEntity;
}
