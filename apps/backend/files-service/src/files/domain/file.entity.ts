import { FileStatus } from '@LucidRF/common';
import { Permission } from './permission.entity';

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
  permissions: Permission[];

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<FileEntity>) {
    Object.assign(this, partial);
  }
}
