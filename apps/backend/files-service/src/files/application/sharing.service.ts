import { PermissionRole } from '@LucidRF/common';
import { ShareResourcePayload, UnshareResourcePayload } from '@LucidRF/files-contracts';
import { Injectable } from '@nestjs/common';
import { FolderEntity } from '../domain/entities';
import { AccessLevel, PermissionAction, ResourceType } from '../domain/enums';
import { FileRepository, FolderRepository } from '../domain/interfaces';
import { determineSharingAction } from '../domain/logic';
import { AclService } from './acl.service';

@Injectable()
export class SharingService {
  constructor(
    private readonly aclService: AclService,
    private readonly fileRepo: FileRepository,
    private readonly folderRepo: FolderRepository
  ) {}

  async shareFile(payload: ShareResourcePayload) {
    await this.aclService.validateAccess(payload.resourceId, payload.userId, ResourceType.FILE, AccessLevel.OWNER);

    return this.fileRepo.addPermission(payload.resourceId, {
      subjectId: payload.subjectId,
      subjectType: payload.subjectType,
      role: payload.role,
    });
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

    const updated = await this.folderRepo.addPermission(payload.resourceId, permission);

    // Propagate Change (Recursive)
    await this.aclService.propagatePermissionChange(payload.resourceId, payload.userId, permission, action);

    return updated;
  }

  async unshareFile(payload: UnshareResourcePayload) {
    await this.aclService.validateAccess(payload.resourceId, payload.userId, ResourceType.FILE, AccessLevel.OWNER);

    return this.fileRepo.removePermission(payload.resourceId, payload.subjectId, payload.subjectType);
  }

  async unshareFolder(payload: UnshareResourcePayload) {
    await this.aclService.validateAccess(payload.resourceId, payload.userId, ResourceType.FOLDER, AccessLevel.OWNER);

    const updated = await this.folderRepo.removePermission(payload.resourceId, payload.subjectId, payload.subjectType);

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

    return updated;
  }
}
