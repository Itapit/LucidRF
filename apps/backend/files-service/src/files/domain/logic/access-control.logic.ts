import { PermissionRole, PermissionType } from '@LucidRF/common';
import { BulkPermissionOperation } from '../dtos';
import { PermissionEntity } from '../entities';
import { FileEntity } from '../entities/file.entity';
import { FolderEntity } from '../entities/folder.entity';
import { PermissionAction } from '../enums';
import { AccessLevel } from '../enums/access-level.enum';

/**
 * Determines if a new permission should overwrite an existing one.
 * Returns TRUE if:
 * 1. The user has no permission yet.
 * 2. The new permission is "stronger" (higher weight) than the existing one.
 * * Returns FALSE if:
 * 1. The user already has equal or higher access.
 */
export function shouldUpgradePermission(
  currentPermissions: PermissionEntity[] = [],
  newPermission: PermissionEntity
): boolean {
  const existing = currentPermissions.find(
    (p) => p.subjectId === newPermission.subjectId && p.subjectType === newPermission.subjectType
  );

  if (!existing) return true;
  return getPermissionWeight(newPermission.role) > getPermissionWeight(existing.role);
}

/**
 * Helper to get the specific weight of a subject (User or Group) on a resource.
 * Returns 0 if not found.
 */
function getSubjectWeight(permissions: PermissionEntity[], subjectId: string, subjectType: PermissionType): number {
  const permission = permissions?.find((p) => p.subjectId === subjectId && p.subjectType === subjectType);

  if (!permission) return 0;
  return getPermissionWeight(permission.role);
}

/**
 * Safe Accessor for Weights.
 */
export function getPermissionWeight(role: AccessLevel | PermissionRole): number {
  switch (role) {
    case AccessLevel.OWNER:
      return 3;

    case AccessLevel.EDITOR:
    case PermissionRole.EDITOR:
      return 2;

    case AccessLevel.VIEWER:
    case PermissionRole.VIEWER:
      return 1;

    default:
      return 0;
  }
}

/**
 * Pure function to check if a user satisfies the required access level for a resource.
 */
export function hasSufficientAccess(
  resource: FileEntity | FolderEntity,
  userId: string,
  requiredLevel: AccessLevel,
  userGroupsIds: string[] = []
): boolean {
  // Resource Owner always has full access
  if (resource.ownerId === userId) return true;

  let maxWeight = getSubjectWeight(resource.permissions, userId, PermissionType.USER);

  if (userGroupsIds.length > 0) {
    for (const groupId of userGroupsIds) {
      const groupWeight = getSubjectWeight(resource.permissions, groupId, PermissionType.GROUP);

      if (groupWeight > maxWeight) {
        maxWeight = groupWeight;
      }
    }
  }
  return maxWeight >= getPermissionWeight(requiredLevel);
}

/**
 * Takes a list of resources (Files/Folders) and determines exactly which ones
 * need to be updated in the database.
 */
export function calculateBulkUpdates(
  resources: (FileEntity | FolderEntity)[],
  permission: PermissionEntity,
  action: PermissionAction
): BulkPermissionOperation[] {
  const operations: BulkPermissionOperation[] = [];

  for (const resource of resources) {
    let shouldProcess = false;

    switch (action) {
      case PermissionAction.REMOVE:
        shouldProcess = true;
        break;

      case PermissionAction.UPDATE:
        // Force Update: We don't care about weights.
        shouldProcess = true;
        break;

      case PermissionAction.ADD:
        // Safe Add: Only process if it upgrades access
        shouldProcess = shouldUpgradePermission(resource.permissions, permission);
        break;
    }

    if (shouldProcess) {
      operations.push({
        resourceId: resource._id.toString(),
        action,
        permission,
      });
    }
  }

  return operations;
}

/**
 * Determines the correct action based on whether the user already exists.
 * - If user exists: Returns UPDATE (Allows downgrades/changes).
 * - If user is new: Returns ADD (Safe add, prevents accidental downgrades on children).
 */
export function determineSharingAction(
  currentPermissions: PermissionEntity[] = [],
  recipientId: string,
  recipientType: PermissionType = PermissionType.USER
): PermissionAction {
  const exists = currentPermissions.find((p) => p.subjectId === recipientId && p.subjectType === recipientType);

  return exists ? PermissionAction.UPDATE : PermissionAction.ADD;
}
