import { FileMetadata } from '@LucidRF/common';
import { CreateFileRepoDto } from '../dtos/create-file-repo.dto';
import { FileEntity } from '../entities';

export abstract class FileRepository {
  /**
   * Updates the metadata of an existing file record.
   */
  abstract updateMetadata(id: string, metadata: FileMetadata, status: string): Promise<FileEntity | null>;

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
   * Retrieves all files within a specific folder that belong to the specified teams.
   * @param folderId The ID of the parent folder (or null for root).
   * @param teamIds The IDs of the teams requesting the list.
   */
  abstract findByFolder(folderId: string | null, teamIds: string[]): Promise<FileEntity[]>;

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
   * SYSTEM INTERNAL: Retrieves ALL files belonging to a specific team.
   */
  abstract findByTeamIdSystem(teamId: string): Promise<FileEntity[]>;

  /**
   * SYSTEM INTERNAL: Deletes all file records belonging to a specific team.
   */
  abstract deleteManyByTeamId(teamId: string): Promise<void>;

  /**
   * Updates the lifecycle status of a file (e.g., PENDING -> UPLOADED).
   */
  abstract updateStatus(id: string, status: string): Promise<FileEntity | null>;

  /**
   * Permanently deletes a single file record by its ID.
   * Throws an exception if the file does not exist.
   */
  abstract delete(id: string): Promise<boolean>;
}
