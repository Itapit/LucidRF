import { CreateFolderPayload, DeleteResourcePayload, GetContentPayload } from '@limbo/files-contracts';
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateFolderRepoDto } from '../domain/dtos/create-folder-repository.dto';
import { FileRepository } from '../domain/file.repository';
import { FolderRepository } from '../domain/folder.repository';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(private readonly folderRepository: FolderRepository, private readonly fileRepository: FileRepository) {}

  async create(payload: CreateFolderPayload) {
    if (payload.parentFolderId) {
      await this.verifyOwner(payload.parentFolderId, payload.userId);
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

    if (targetId) await this.verifyOwner(targetId, userId);

    const [files, folders] = await Promise.all([
      this.fileRepository.findByFolder(targetId, userId),
      this.folderRepository.findSubFolders(targetId, userId),
    ]);

    return { files, folders };
  }

  async delete(payload: DeleteResourcePayload) {
    const { userId, id } = payload;
    await this.verifyOwner(id, userId);
    await this.recursiveDelete(id, userId);
    return { success: true, id };
  }

  // --- Helpers ---

  private async recursiveDelete(folderId: string, userId: string) {
    const subFolders = await this.folderRepository.findSubFolders(folderId, userId);

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

  async verifyOwner(folderId: string, userId: string) {
    const folder = await this.folderRepository.findById(folderId);
    if (!folder) throw new NotFoundException(`Folder ${folderId} not found`);
    if (folder.ownerId !== userId) throw new UnauthorizedException('Access denied');
    return folder;
  }
}
