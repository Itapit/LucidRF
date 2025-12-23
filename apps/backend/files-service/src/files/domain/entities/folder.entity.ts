import { PermissionEntity } from './permission.entity';

export class FolderEntity {
  _id?: string;
  name: string;
  ownerId: string;

  // Hierarchy
  parentFolderId?: string | null;

  // Security
  permissions: PermissionEntity[];

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<FolderEntity>) {
    Object.assign(this, partial);
  }
}
