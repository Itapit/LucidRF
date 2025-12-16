import { CreateFolderPayload, DeleteResourcePayload, GetContentPayload } from '@LucidRF/files-contracts';
import { Injectable, Logger } from '@nestjs/common';
import { CreateFolderRepoDto } from '../domain/dtos/create-folder-repository.dto';
import { AccessLevel, ResourceType } from '../domain/enums';
import { FileRepository } from '../domain/file.repository';
import { FolderRepository } from '../domain/folder.repository';
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
    if (payload.parentFolderId) {
      await this.aclService.validateAccess(
        payload.parentFolderId,
        payload.userId,
        ResourceType.FOLDER,
        AccessLevel.OWNER
      );
    }

    const dto: CreateFolderRepoDto = {
      name: payload.name,
      ownerId: payload.userId,
      parentFolderId: payload.parentFolderId || null,
      permissions: [],
    };

    const folder = await this.folderRepository.create(dto);
    this.logger.log(`Created folder ${folder._id}`);
    return folder;
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

    return { files, folders };
  }

  async delete(payload: DeleteResourcePayload) {
    const { userId, resourceId } = payload;
    await this.aclService.validateAccess(resourceId, userId, ResourceType.FOLDER, AccessLevel.OWNER);
    await this.recursiveDelete(resourceId, userId);
    return { success: true, resourceId };
  }

  // --- Helpers ---

  private async recursiveDelete(folderId: string, userId: string) {
    const subFolders = await this.folderRepository.findSubFolders(folderId, userId);
    //TODO add recursive delete that will ignore ownerId so no orphan folders/files uploaded by other users remain
    // Delete sub-folders first
    for (const sub of subFolders) {
      if (sub._id) await this.recursiveDelete(sub._id, userId);
    }

    // Delete files in this folder
    const files = await this.fileRepository.findByFolder(folderId, userId);
    for (const file of files) {
      if (file._id) await this.fileRepository.delete(file._id);
    }

    await this.folderRepository.delete(folderId);
  }
}
