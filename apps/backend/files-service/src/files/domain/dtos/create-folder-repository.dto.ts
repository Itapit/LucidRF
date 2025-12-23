import { PermissionEntity } from '../entities';

export class CreateFolderRepoDto {
  name: string;
  ownerId: string;
  parentFolderId: string | null;
  permissions: PermissionEntity[];
}
