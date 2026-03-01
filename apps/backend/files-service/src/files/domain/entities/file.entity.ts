import { FileStatus } from '@LucidRF/common';

export class FileEntity {
  id: string;
  originalFileName: string;
  teamId: string;
  size: number;
  mimeType: string;
  status: FileStatus;

  // Infrastructure
  storageKey: string;
  bucket: string;

  // Hierarchy
  parentFolderId?: string | null;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<FileEntity>) {
    Object.assign(this, partial);
  }
}
