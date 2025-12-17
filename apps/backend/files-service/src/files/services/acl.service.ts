import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PermissionEntity } from '../domain/entities';
import { AccessLevel, PermissionAction, ResourceType } from '../domain/enums';
import { hasSufficientAccess } from '../domain/logic';
import { FileRepository, FolderRepository } from '../domain/repositories';
import { TransactionManager } from '../domain/transaction.manager';
import { PermissionPropagationService } from './permission-propagation.service';

@Injectable()
export class AclService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository,
    private readonly txManager: TransactionManager,
    private readonly propagationService: PermissionPropagationService
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
      // Delegate "Heavy Lifting" to the Helper Service
      // This fetches children, calculates upgrades (Domain Logic), and executes Bulk Writes (Infra)
      const subFolders = await this.propagationService.processFolderLevel(folderId, permission, action);

      for (const folder of subFolders) {
        await this.propagatePermissionChange(folder._id.toString(), ownerId, permission, action);
      }
    });
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
