import { PermissionDto } from './permission.dto';

export class FolderDto {
  id!: string;
  name!: string;
  ownerId!: string;
  parentFolderId?: string | null;
  permissions!: PermissionDto[];
  createdAt!: Date;
  updatedAt!: Date;
}
