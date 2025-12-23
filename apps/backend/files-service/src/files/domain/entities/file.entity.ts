import { FileStatus } from '@LucidRF/common';
import { PermissionEntity } from './permission.entity';

export class FileEntity {
  _id?: string;
  originalFileName: string;
  ownerId: string;
  size: number;
  mimeType: string;
  status: FileStatus;

  // Infrastructure
  storageKey: string;
  bucket: string;

  // Hierarchy
  parentFolderId?: string | null;

  // Security
  permissions: PermissionEntity[];

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<FileEntity>) {
    Object.assign(this, partial);
  }
}
