import { CreateFolderPayload, DeleteResourcePayload, GetContentPayload } from '@LucidRF/files-contracts';
import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../../storage/interfaces';
import { CreateFolderRepoDto } from '../domain/dtos';
import { toFileDto, toFolderDto } from '../domain/entities';
import { ResourceNotFoundException, UserDoesntHaveAccessToTeamException } from '../domain/exceptions';
import { FileRepository, FolderRepository, TeamsService } from '../domain/interfaces';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly fileRepository: FileRepository,
    private readonly storageService: StorageService,
    private readonly teamsService: TeamsService
  ) {}

  async create(payload: CreateFolderPayload) {
    const { userId, teamId, name, parentFolderId } = payload;

    await this.validateTeamAccess(userId, teamId);

    if (parentFolderId) {
      const parent = await this.folderRepository.findById(parentFolderId);
      if (!parent || parent.teamId !== teamId) {
        throw new ResourceNotFoundException(parentFolderId);
      }
    }

    const dto: CreateFolderRepoDto = {
      name,
      teamId,
      parentFolderId: parentFolderId || null,
      createdBy: userId,
    };

    const folder = await this.folderRepository.create(dto);
    this.logger.log(`Created folder ${folder.id} for user ${userId} in team ${teamId}`);
    return toFolderDto(folder);
  }

  async listContent(payload: GetContentPayload) {
    const { userId, teamId, folderId } = payload;
    const targetId = folderId || null;

    // Validate the user has access to the requested team
    await this.validateTeamAccess(userId, teamId);

    let currentFolderDto = undefined;
    const ancestors = [];

    if (targetId) {
      const folder = await this.folderRepository.findById(targetId);
      if (!folder || folder.teamId !== teamId) {
        throw new ResourceNotFoundException(targetId);
      }

      currentFolderDto = toFolderDto(folder);

      // Walk up the hierarchy to get ancestors
      let parentId = folder.parentFolderId;
      while (parentId) {
        const parentFolder = await this.folderRepository.findById(parentId);
        if (!parentFolder || parentFolder.teamId !== teamId) {
          break; // Stop if parent not found or access denied
        }
        ancestors.unshift(toFolderDto(parentFolder)); // Add to the beginning to maintain root -> current order
        parentId = parentFolder.parentFolderId;
      }
    }

    const targetTeamIds = [teamId];

    const [files, folders] = await Promise.all([
      this.fileRepository.findByFolder(targetId, targetTeamIds),
      this.folderRepository.findSubFolders(targetId, targetTeamIds),
    ]);

    return {
      files: files.map(toFileDto),
      folders: folders.map(toFolderDto),
      ...(currentFolderDto && { currentFolder: currentFolderDto }),
      ...(ancestors.length > 0 && { ancestors }),
    };
  }

  async delete(payload: DeleteResourcePayload) {
    const { userId, resourceId } = payload;
    const folder = await this.folderRepository.findById(resourceId);
    if (!folder) throw new ResourceNotFoundException(resourceId);

    await this.validateTeamAccess(userId, folder.teamId);
    const deleted = await this.recursiveDelete(resourceId);

    if (!deleted) {
      throw new ResourceNotFoundException(resourceId);
    }
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
      if (sub.id) await this.recursiveDelete(sub.id);
    }
    const files = await this.fileRepository.findByFolderIdSystem(folderId);

    const storageKeys = files.map((f) => f.storageKey);
    if (storageKeys.length > 0) {
      await this.storageService.deleteMany(storageKeys);
    }

    await this.fileRepository.deleteManyByFolderId(folderId);

    return this.folderRepository.delete(folderId);
  }

  private async validateTeamAccess(userId: string, teamId: string): Promise<void> {
    const teamIds = await this.teamsService.getUserTeamIds(userId);
    if (!teamIds.includes(teamId)) {
      throw new UserDoesntHaveAccessToTeamException(userId, teamId);
    }
  }
}
