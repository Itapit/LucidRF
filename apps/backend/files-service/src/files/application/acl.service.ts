import { Injectable } from '@nestjs/common';
import { FileEntity, FolderEntity, PermissionEntity } from '../domain/entities';
import { AccessLevel, PermissionAction, ResourceType } from '../domain/enums';
import { InvalidPermissionException, ResourceNotFoundException } from '../domain/exceptions';
import { FileRepository, FolderRepository, GroupsService } from '../domain/interfaces';
import { hasSufficientAccess } from '../domain/logic';
import { TransactionManager } from '../domain/transaction.manager';
import { PermissionPropagationService } from './permission-propagation.service';

@Injectable()
export class AclService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository,
    private readonly txManager: TransactionManager,
    private readonly propagationService: PermissionPropagationService,
    private readonly groupsService: GroupsService
  ) {}

  /**
   * Validates if a user has the required access level for a resource.
   * Returns the resource if successful.
   */
  async validateAccess(
    resourceId: string,
    userId: string,
    type: ResourceType,
    requiredLevel: AccessLevel
  ): Promise<FileEntity | FolderEntity> {
    const resource = await this.getResource(resourceId, type);

    if (hasSufficientAccess(resource, userId, requiredLevel)) {
      return resource;
    }
    const userGroupIds = await this.groupsService.getUserGroupIds(userId);

    if (hasSufficientAccess(resource, userId, requiredLevel, userGroupIds)) {
      return resource;
    }
    throw new InvalidPermissionException(resourceId);
  }

  /**
   * Recursive method to update permissions down the tree.
   * Manages the Transaction Boundary and Recursion Loop.
   */
  async propagatePermissionChange(
    folderId: string,
    ownerId: string,
    permission: PermissionEntity,
    action: PermissionAction
  ): Promise<void> {
    await this.txManager.run(async () => {
      await this.recursivePropagate(folderId, ownerId, permission, action);
    });
  }

  // =================================================================================================
  //  Helpers
  // =================================================================================================

  /**
   * Recursively propagates permission changes to sub-folders.
   */
  private async recursivePropagate(
    folderId: string,
    ownerId: string,
    permission: PermissionEntity,
    action: PermissionAction
  ): Promise<void> {
    // Process the current folder level (Bulk Writes)
    // This service should pick up the active session from your DatabaseContext/CLS
    const subFolders = await this.propagationService.processFolderLevel(folderId, permission, action);

    // Recursively process children
    for (const folder of subFolders) {
      if (folder._id) {
        await this.recursivePropagate(folder._id, ownerId, permission, action);
      }
    }
  }

  /**
   * Fetches a resource by ID and Type.
   */
  async getResource(resourceId: string, type: ResourceType) {
    const repo = type === ResourceType.FILE ? this.fileRepository : this.folderRepository;
    const resource = await repo.findById(resourceId);

    if (!resource) {
      throw new ResourceNotFoundException(resourceId);
    }

    return resource;
  }
}
