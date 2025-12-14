import { PermissionType } from '@limbo/common';
import { CreateFileRepoDto } from './dtos/create-file-repo.dto';
import { FileEntity } from './entities/file.entity';
import { Permission } from './permission.entity';

export abstract class FileRepository {
  abstract create(dto: CreateFileRepoDto): Promise<FileEntity>;
  abstract findById(id: string): Promise<FileEntity | null>;

  /**
   * Finds all files in a specific folder for a given owner.
   * Note: Does not handle shared files (that logic usually sits in a generic "findAccessible" method or Service layer).
   */
  abstract findByFolder(folderId: string | null, ownerId: string): Promise<FileEntity[]>;

  abstract updateStatus(id: string, status: string): Promise<FileEntity>;

  abstract delete(id: string): Promise<void>;

  // --- Sharing / ACL ---

  /**
   * Adds or Updates (Upsert) a permission for a user or group.
   */
  abstract addPermission(id: string, permission: Permission): Promise<FileEntity>;

  /**
   * Removes a specific permission.
   */
  abstract removePermission(id: string, subjectId: string, subjectType: PermissionType): Promise<FileEntity>;
}
