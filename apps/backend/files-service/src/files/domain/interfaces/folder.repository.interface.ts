import { CreateFolderRepoDto } from '../dtos/create-folder-repository.dto';
import { FolderEntity } from '../entities';

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
   * Retrieves all immediate sub-folders within a specific parent folder that belong to the specified teams.
   * @param parentFolderId The ID of the parent folder (or null for root).
   * @param teamIds The IDs of the teams requesting the list.
   */
  abstract findSubFolders(parentFolderId: string | null, teamIds: string[]): Promise<FolderEntity[]>;

  /**
   * SYSTEM INTERNAL: Retrieves ALL sub-folders for a given parent regardless of ownership or permissions.
   * Used for recursive operations (like delete propagation or permission cascading) where the system needs full visibility.
   */
  abstract findSubFoldersByParentIdSystem(parentFolderId: string): Promise<FolderEntity[]>;

  /**
   * Permanently deletes a single folder record by its ID.
   * Throws an exception if the folder does not exist.
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * SYSTEM INTERNAL: Deletes all folder records belonging to a specific team.
   */
  abstract deleteManyByTeamId(teamId: string): Promise<void>;
}
