import { PermissionRole, PermissionType } from '@LucidRF/common';
import { FolderEntity } from '../entities/folder.entity';
import { PermissionEntity } from '../entities/permission.entity';

/**
 * Calculates the initial permissions for a new resource (File/Folder)
 * based on its parent folder.
 * * Rules:
 * 1. Inherit all shared permissions from the parent.
 * 2. If the creator is NOT the parent's owner, grant the parent's owner EDITOR access.
 */
export function calculateInheritedPermissions(parentFolder: FolderEntity, creatorId: string): PermissionEntity[] {
  const permissions: PermissionEntity[] = parentFolder.permissions ? [...parentFolder.permissions] : [];

  if (parentFolder.ownerId !== creatorId) {
    const alreadyHasAccess = permissions.some(
      (p) => p.subjectId === parentFolder.ownerId && p.subjectType === PermissionType.USER
    );

    if (!alreadyHasAccess) {
      permissions.push({
        subjectId: parentFolder.ownerId,
        subjectType: PermissionType.USER,
        role: PermissionRole.EDITOR,
      });
    }
  }

  return permissions.filter((p) => p.subjectId !== creatorId);
}
