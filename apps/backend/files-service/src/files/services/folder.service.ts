import { CreateFolderPayload, DeleteResourcePayload, GetContentPayload } from '@LucidRF/files-contracts';
import { Injectable, Logger } from '@nestjs/common';
import { CreateFolderRepoDto } from '../domain/dtos';
import { FolderEntity, PermissionEntity, toFileDto, toFolderDto } from '../domain/entities';
import { AccessLevel, ResourceType } from '../domain/enums';
import { calculateInheritedPermissions } from '../domain/logic/permission.logic';
import { FileRepository, FolderRepository } from '../domain/repositories';
import { AclService } from './acl.service';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly fileRepository: FileRepository,
    private readonly aclService: AclService
  ) {}

  async create(payload: CreateFolderPayload) {
    let permissions: PermissionEntity[] = [];

    if (payload.parentFolderId) {
      const parent = (await this.aclService.validateAccess(
        payload.parentFolderId,
        payload.userId,
        ResourceType.FOLDER,
        AccessLevel.EDITOR
      )) as FolderEntity;

      permissions = calculateInheritedPermissions(parent, payload.userId);
    }

    const dto: CreateFolderRepoDto = {
      name: payload.name,
      ownerId: payload.userId,
      parentFolderId: payload.parentFolderId || null,
      permissions,
    };

    const folder = await this.folderRepository.create(dto);
    this.logger.log(`Created folder ${folder._id}`);
    return toFolderDto(folder);
  }

  async listContent(payload: GetContentPayload) {
    const { userId, folderId } = payload;
    const targetId = folderId || null;

    if (targetId) {
      await this.aclService.validateAccess(targetId, userId, ResourceType.FOLDER, AccessLevel.VIEWER);
    }

    const [files, folders] = await Promise.all([
      this.fileRepository.findByFolder(targetId, userId),
      this.folderRepository.findSubFolders(targetId, userId),
    ]);

    return {
      files: files.map(toFileDto),
      folders: folders.map(toFolderDto),
    };
  }

  async delete(payload: DeleteResourcePayload) {
    const { userId, resourceId } = payload;
    await this.aclService.validateAccess(resourceId, userId, ResourceType.FOLDER, AccessLevel.OWNER);
    await this.recursiveDelete(resourceId);
    return { success: true, resourceId };
  }

  /**
   * Recursive helper that uses SYSTEM methods to clean up
   */
  private async recursiveDelete(folderId: string) {
    // Find Subfolders using SYSTEM access (ignores ownership/permissions)
    const subFolders = await this.folderRepository.findSubFoldersByParentIdSystem(folderId);

    // Recurse First (Depth-First Traversal)
    for (const sub of subFolders) {
      if (sub._id) await this.recursiveDelete(sub._id.toString());
    }

    await this.fileRepository.deleteManyByFolderId(folderId);

    await this.folderRepository.delete(folderId);
  }
}
