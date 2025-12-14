import { PermissionRole } from '@limbo/common';
import { Injectable, Logger } from '@nestjs/common';
import { FileRepository } from '../domain/file.repository';
import { FolderRepository } from '../domain/folder.repository';
import { Permission } from '../domain/permission.entity';

@Injectable()
export class AclService {
  private readonly logger = new Logger(AclService.name);

  constructor(private readonly fileRepository: FileRepository, private readonly folderRepository: FolderRepository) {}

  async propagatePermissionChange(folderId: string, ownerId: string, permission: Permission, action: 'ADD' | 'REMOVE') {
    this.logger.log(`Starting recursive permission propagation (${action}) for folder ${folderId}`);

    // Get Children
    const [subFolders, files] = await Promise.all([
      this.folderRepository.findSubFolders(folderId, ownerId),
      this.fileRepository.findByFolder(folderId, ownerId),
    ]);

    // Process Files
    for (const file of files) {
      if (!file._id) continue;
      if (action === 'ADD') {
        if (this.shouldUpgradePermission(file.permissions, permission)) {
          await this.fileRepository.addPermission(file._id, permission);
        }
      } else {
        await this.fileRepository.removePermission(file._id, permission.subjectId, permission.subjectType);
      }
    }

    // Process Subfolders (Recursion)
    for (const folder of subFolders) {
      if (!folder._id) continue;

      if (action === 'ADD') {
        if (this.shouldUpgradePermission(folder.permissions, permission)) {
          await this.folderRepository.addPermission(folder._id, permission);
        }
      } else {
        await this.folderRepository.removePermission(folder._id, permission.subjectId, permission.subjectType);
      }

      // Recurse
      await this.propagatePermissionChange(folder._id, ownerId, permission, action);
    }

    // Optional: Log completion
    this.logger.debug(`Finished propagation for folder ${folderId}`);
  }

  private shouldUpgradePermission(currentPermissions: Permission[], newPermission: Permission): boolean {
    const existing = currentPermissions.find(
      (p) => p.subjectId === newPermission.subjectId && p.subjectType === newPermission.subjectType
    );

    if (!existing) return true;

    const existingWeight = this.getPermissionWeight(existing.role);
    const newWeight = this.getPermissionWeight(newPermission.role);

    return newWeight > existingWeight;
  }

  private getPermissionWeight(role: PermissionRole): number {
    switch (role) {
      case PermissionRole.EDITOR:
        return 2;
      case PermissionRole.VIEWER:
        return 1;
      default:
        return 0;
    }
  }
}
