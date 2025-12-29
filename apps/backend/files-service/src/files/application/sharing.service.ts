import { PermissionRole } from '@LucidRF/common';
import { ShareResourcePayload, UnshareResourcePayload } from '@LucidRF/files-contracts';
import { Injectable } from '@nestjs/common';
import { FolderEntity } from '../domain/entities';
import { AccessLevel, PermissionAction, ResourceType } from '../domain/enums';
import { ResourceNotFoundException } from '../domain/exceptions';
import { FileRepository, FolderRepository } from '../domain/interfaces';
import { determineSharingAction } from '../domain/logic';
import { TransactionManager } from '../domain/transaction.manager';
import { AclService } from './acl.service';

@Injectable()
export class SharingService {
  constructor(
    private readonly aclService: AclService,
    private readonly fileRepo: FileRepository,
    private readonly folderRepo: FolderRepository,
    private readonly txManager: TransactionManager
  ) {}

  async shareFile(payload: ShareResourcePayload) {
    await this.aclService.validateAccess(payload.resourceId, payload.userId, ResourceType.FILE, AccessLevel.OWNER);

    const updatedFile = await this.fileRepo.addPermission(payload.resourceId, {
      subjectId: payload.subjectId,
      subjectType: payload.subjectType,
      role: payload.role,
    });
    if (!updatedFile) {
      throw new ResourceNotFoundException(payload.resourceId);
    }
    return updatedFile;
  }

  async shareFolder(payload: ShareResourcePayload) {
    const folder = (await this.aclService.validateAccess(
      payload.resourceId,
      payload.userId,
      ResourceType.FOLDER,
      AccessLevel.OWNER
    )) as FolderEntity;

    const action = determineSharingAction(folder.permissions, payload.subjectId, payload.subjectType);

    const permission = {
      subjectId: payload.subjectId,
      subjectType: payload.subjectType,
      role: payload.role,
    };

    return this.txManager.run(async () => {
      const updatedFolder = await this.folderRepo.addPermission(payload.resourceId, permission);

      if (!updatedFolder) {
        throw new ResourceNotFoundException(payload.resourceId);
      }
      // Propagate Change (Recursive)
      await this.aclService.propagatePermissionChange(payload.resourceId, payload.userId, permission, action);

      return updatedFolder;
    });
  }

  async unshareFile(payload: UnshareResourcePayload) {
    await this.aclService.validateAccess(payload.resourceId, payload.userId, ResourceType.FILE, AccessLevel.OWNER);

    const updatedFile = await this.fileRepo.removePermission(
      payload.resourceId,
      payload.subjectId,
      payload.subjectType
    );
    if (!updatedFile) {
      throw new ResourceNotFoundException(payload.resourceId);
    }
    return updatedFile;
  }

  async unshareFolder(payload: UnshareResourcePayload) {
    await this.aclService.validateAccess(payload.resourceId, payload.userId, ResourceType.FOLDER, AccessLevel.OWNER);

    return this.txManager.run(async () => {
      const updatedFolder = await this.folderRepo.removePermission(
        payload.resourceId,
        payload.subjectId,
        payload.subjectType
      );

      if (!updatedFolder) {
        throw new ResourceNotFoundException(payload.resourceId);
      }

      // Propagate Removal (Recursive)
      const permission = {
        subjectId: payload.subjectId,
        subjectType: payload.subjectType,
        role: PermissionRole.VIEWER,
      };

      await this.aclService.propagatePermissionChange(
        payload.resourceId,
        payload.userId,
        permission,
        PermissionAction.REMOVE
      );

      return updatedFolder;
    });
  }
}
