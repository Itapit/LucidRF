import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FileEntity, FolderEntity, PermissionEntity } from '../domain/entities';
import { AccessLevel, PermissionAction, ResourceType } from '../domain/enums';
import { hasSufficientAccess, shouldUpgradePermission } from '../domain/logic';
import { FileRepository, FolderRepository } from '../domain/repositories';
import { TransactionManager } from '../domain/transaction.manager';

//TODO add p-limit

@Injectable()
export class AclService {
  private readonly logger = new Logger(AclService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository,
    private readonly txManager: TransactionManager
  ) {}

  /**
   * Validates if a user has the required access level for a resource.
   * Returns the resource if successful.
   */
  async validateAccess(resourceId: string, userId: string, type: ResourceType, level: AccessLevel) {
    const resource = await this.getResource(resourceId, type);

    if (!hasSufficientAccess(resource, userId, level)) {
      throw new ForbiddenException(`User ${userId} lacks ${level} access to ${type} ${resourceId}`);
    }

    return resource;
  }

  async propagatePermissionChange(
    folderId: string,
    ownerId: string,
    permission: PermissionEntity,
    action: PermissionAction
  ): Promise<void> {
    await this.txManager.run(async () => {
      await this.executePropagation(folderId, ownerId, permission, action);
    });
  }

  private async executePropagation(
    folderId: string,
    ownerId: string,
    permission: PermissionEntity,
    action: PermissionAction
  ) {
    this.logger.log(`Starting propagation (${action}) for folder ${folderId}`);

    const [subFolders, files] = await Promise.all([
      this.folderRepository.findSubFoldersByParentIdSystem(folderId),
      this.fileRepository.findByFolderIdSystem(folderId),
    ]);

    await Promise.all([
      this.propagateToFiles(files, permission, action),
      this.propagateToFolders(subFolders, ownerId, permission, action),
    ]);
  }

  /**
   * Helper: Iterates over File Entities and applies updates via Repository.
   */
  private async propagateToFiles(
    files: FileEntity[],
    permission: PermissionEntity,
    action: PermissionAction
  ): Promise<void> {
    const operations = files.map((file) => {
      const fileId = file._id.toString();

      if (action === PermissionAction.ADD) {
        return shouldUpgradePermission(file.permissions, permission)
          ? this.fileRepository.addPermission(fileId, permission)
          : Promise.resolve();
      } else {
        return this.fileRepository.removePermission(fileId, permission.subjectId, permission.subjectType);
      }
    });

    await Promise.all(operations);
  }

  /**
   * Iterates over Folder Entities, updates them, and Recurses.
   */
  private async propagateToFolders(
    folders: FolderEntity[],
    ownerId: string,
    permission: PermissionEntity,
    action: PermissionAction
  ): Promise<void> {
    const operations = folders.map(async (folder) => {
      const folderId = folder._id.toString();

      if (action === PermissionAction.ADD) {
        if (shouldUpgradePermission(folder.permissions, permission)) {
          await this.folderRepository.addPermission(folderId, permission);
        }
      } else {
        await this.folderRepository.removePermission(folderId, permission.subjectId, permission.subjectType);
      }

      await this.propagatePermissionChange(folderId, ownerId, permission, action);
    });

    await Promise.all(operations);
  }

  // =================================================================================================
  //  Helpers
  // =================================================================================================

  /**
   * Fetches a resource by ID and Type.
   */
  async getResource(resourceId: string, type: ResourceType) {
    const repo = type === ResourceType.FILE ? this.fileRepository : this.folderRepository;
    const resource = await repo.findById(resourceId);

    if (!resource) {
      throw new NotFoundException(`${type} ${resourceId} not found`);
    }

    return resource;
  }
}
