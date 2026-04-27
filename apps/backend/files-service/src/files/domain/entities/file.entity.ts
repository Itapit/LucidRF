import { FileMetadata, FileStatus } from '@LucidRF/common';

export class FileEntity {
  id!: string;
  originalFileName!: string;
  teamId!: string;
  size!: number;
  mimeType!: string;
  status!: FileStatus;
  metadata?: FileMetadata;

  // Infrastructure
  storageKey!: string;
  bucket!: string;

  // Hierarchy
  parentFolderId?: string | null;

  uploadedBy!: string;

  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<FileEntity>) {
    Object.assign(this, partial);
  }
}
