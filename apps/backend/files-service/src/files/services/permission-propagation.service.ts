import { Injectable, Logger } from '@nestjs/common';
import { FolderEntity, PermissionEntity } from '../domain/entities';
import { PermissionAction } from '../domain/enums';
import { calculateBulkUpdates } from '../domain/logic/access-control.logic';
import { FileRepository, FolderRepository } from '../domain/repositories';

@Injectable()
export class PermissionPropagationService {
  private readonly logger = new Logger(PermissionPropagationService.name);

  constructor(private readonly fileRepository: FileRepository, private readonly folderRepository: FolderRepository) {}

  /**
   * Orchestrates the update for a single folder level:
   * 1. Fetches children.
   * 2. Calculates updates (Domain).
   * 3. Executes Bulk Writes (Infra).
   * 4. Returns subfolders for recursion.
   */
  async processFolderLevel(
    folderId: string,
    permission: PermissionEntity,
    action: PermissionAction
  ): Promise<FolderEntity[]> {
    this.logger.log(`Processing level for folder ${folderId}`);

    // Fetch Data (Sequential Read)
    const subFolders = await this.folderRepository.findSubFoldersByParentIdSystem(folderId);
    const files = await this.fileRepository.findByFolderIdSystem(folderId);

    // Process Files
    const fileOps = calculateBulkUpdates(files, permission, action);
    if (fileOps.length > 0) {
      await this.fileRepository.updatePermissionsBulk(fileOps);
    }

    // Process Folders
    const folderOps = calculateBulkUpdates(subFolders, permission, action);
    if (folderOps.length > 0) {
      await this.folderRepository.updatePermissionsBulk(folderOps);
    }

    // Return subfolders so the caller can decide how to recurse
    return subFolders;
  }
}
