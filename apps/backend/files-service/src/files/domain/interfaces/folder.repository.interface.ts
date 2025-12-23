import { PermissionType } from '@LucidRF/common';
import { BulkPermissionOperation } from '../dtos';
import { CreateFolderRepoDto } from '../dtos/create-folder-repository.dto';
import { FolderEntity, PermissionEntity } from '../entities';

export abstract class FolderRepository {
  /**
   * Persists a new folder metadata record to the database.
   */
  abstract create(dto: CreateFolderRepoDto): Promise<FolderEntity>;

  /**
   * Retrieves a single folder entity by its unique identifier.
   * Returns null if no folder is found.
   */
  abstract findById(id: string): Promise<FolderEntity | null>;

  /**
   * Retrieves all immediate sub-folders within a specific parent folder that are visible to the user.
   * This includes folders owned by the user AND folders shared with them.
   * @param parentFolderId The ID of the parent folder (or null for root).
   * @param userId The ID of the user requesting the list.
   */
  abstract findSubFolders(parentFolderId: string | null, userId: string): Promise<FolderEntity[]>;

  /**
   * SYSTEM INTERNAL: Retrieves ALL sub-folders for a given parent regardless of ownership or permissions.
   * Used for recursive operations (like delete propagation or permission cascading) where the system needs full visibility.
   */
  abstract findSubFoldersByParentIdSystem(parentFolderId: string): Promise<FolderEntity[]>;

  /**
   * Permanently deletes a single folder record by its ID.
   * Throws an exception if the folder does not exist.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Adds a new permission or updates an existing one for a specific subject (User/Group).
   * This effectively shares the folder with that subject.
   */
  abstract addPermission(id: string, permission: PermissionEntity): Promise<FolderEntity>;

  /**
   * Revokes access for a specific subject by removing their permission entry.
   */
  abstract removePermission(id: string, subjectId: string, subjectType: PermissionType): Promise<FolderEntity>;

  /**
   * Update permission in bulk for multiple folders.
   */
  abstract updatePermissionsBulk(operations: BulkPermissionOperation[]): Promise<void>;

  /**
   * Retrieves all folders that are shared with a specific user or any of the groups they belong to.
   */
  abstract findSharedWith(userId: string, groupIds: string[]): Promise<FolderEntity[]>;
}
