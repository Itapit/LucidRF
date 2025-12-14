import { PermissionType } from '@limbo/common';
import { CreateFolderRepoDto } from './dtos/create-folder-repository.dto';
import { FolderEntity } from './folder.entity';
import { Permission } from './permission.entity';

export abstract class FolderRepository {
  // --- CRUD ---
  abstract create(dto: CreateFolderRepoDto): Promise<FolderEntity>;
  abstract findById(id: string): Promise<FolderEntity | null>;

  abstract findSubFolders(parentFolderId: string | null, ownerId: string): Promise<FolderEntity[]>;

  abstract delete(id: string): Promise<void>;

  // --- Sharing / ACL ---

  abstract addPermission(id: string, permission: Permission): Promise<FolderEntity>;

  abstract removePermission(id: string, subjectId: string, subjectType: PermissionType): Promise<FolderEntity>;
}
