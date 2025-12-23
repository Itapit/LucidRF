import { PermissionType } from '@LucidRF/common';
import { BulkPermissionOperation } from '../dtos';
import { CreateFileRepoDto } from '../dtos/create-file-repo.dto';
import { FileEntity, PermissionEntity } from '../entities';

export abstract class FileRepository {
  /**
   * Persists a new file metadata record to the database.
   */
  abstract create(dto: CreateFileRepoDto): Promise<FileEntity>;

  /**
   * Retrieves a single file entity by its unique identifier.
   * Returns null if no file is found.
   */
  abstract findById(id: string): Promise<FileEntity | null>;

  /**
   * Retrieves all files within a specific folder that are visible to the given user.
   * This includes files owned by the user AND files shared with them.
   * @param folderId The ID of the parent folder (or null for root).
   * @param userId The ID of the user requesting the list.
   */
  abstract findByFolder(folderId: string | null, ownerId: string): Promise<FileEntity[]>;

  /**
   * SYSTEM INTERNAL: Retrieves ALL files in a folder regardless of ownership or permissions.
   * Used for recursive operations (like delete propagation) where the system needs full visibility.
   */
  abstract findByFolderIdSystem(folderId: string): Promise<FileEntity[]>;

  /**
   * SYSTEM INTERNAL: Deletes all file records belonging to a specific parent folder.
   * Used for efficient recursive cleanup to avoid N+1 delete calls.
   */
  abstract deleteManyByFolderId(folderId: string): Promise<void>;

  /**
   * Updates the lifecycle status of a file (e.g., PENDING -> UPLOADED).
   */
  abstract updateStatus(id: string, status: string): Promise<FileEntity>;

  /**
   * Permanently deletes a single file record by its ID.
   * Throws an exception if the file does not exist.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Adds a new permission or updates an existing one for a specific subject (User/Group).
   * This effectively shares the file with that subject.
   */
  abstract addPermission(id: string, permission: PermissionEntity): Promise<FileEntity>;

  /**
   * Revokes access for a specific subject by removing their permission entry.
   */
  abstract removePermission(id: string, subjectId: string, subjectType: PermissionType): Promise<FileEntity>;

  /**
   * Updates the permissions of multiple files in bulk.
   */
  abstract updatePermissionsBulk(operations: BulkPermissionOperation[]): Promise<void>;

  /**
   * Retrieves all files that are shared with a specific user or any of the groups they belong to.
   */
  abstract findSharedWith(userId: string, groupIds: string[]): Promise<FileEntity[]>;
}
