import { PermissionRole } from '@limbo/common';
import { ShareResourcePayload, UnshareResourcePayload } from '@limbo/files-contracts';
import { Injectable } from '@nestjs/common';

import { FileRepository } from './domain/file.repository';
import { FolderRepository } from './domain/folder.repository';
import { AclService } from './services/acl.service';
import { FileService } from './services/file.service';
import { FolderService } from './services/folder.service';

@Injectable()
export class FilesService {
  constructor(
    public readonly file: FileService,
    public readonly folder: FolderService,
    private readonly acl: AclService,
    private readonly fileRepo: FileRepository,
    private readonly folderRepo: FolderRepository
  ) {}

  async shareFile(payload: ShareResourcePayload) {
    await this.file.verifyOwner(payload.resourceId, payload.userId);

    return this.fileRepo.addPermission(payload.resourceId, {
      subjectId: payload.subjectId,
      subjectType: payload.subjectType,
      role: payload.role,
    });
  }

  async shareFolder(payload: ShareResourcePayload) {
    await this.folder.verifyOwner(payload.resourceId, payload.userId);

    const permission = {
      subjectId: payload.subjectId,
      subjectType: payload.subjectType,
      role: payload.role,
    };

    const updated = await this.folderRepo.addPermission(payload.resourceId, permission);

    // Propagate
    await this.acl.propagatePermissionChange(payload.resourceId, payload.userId, permission, 'ADD');

    return updated;
  }

  async unshareFile(payload: UnshareResourcePayload) {
    await this.file.verifyOwner(payload.resourceId, payload.userId);
    return this.fileRepo.removePermission(payload.resourceId, payload.subjectId, payload.subjectType);
  }

  async unshareFolder(payload: UnshareResourcePayload) {
    await this.folder.verifyOwner(payload.resourceId, payload.userId);

    const updated = await this.folderRepo.removePermission(payload.resourceId, payload.subjectId, payload.subjectType);
    const dummyPerm = { subjectId: payload.subjectId, subjectType: payload.subjectType, role: PermissionRole.VIEWER };

    // Propagate Removal
    await this.acl.propagatePermissionChange(payload.resourceId, payload.userId, dummyPerm, 'REMOVE');

    return updated;
  }
}
