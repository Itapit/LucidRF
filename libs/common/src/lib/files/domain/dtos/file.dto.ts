import { FileStatus } from '../enums/file-status.enum';
import { FileMetadata } from '../interfaces/file-metadata.interface';

export class FileDto {
  resourceId!: string;
  originalFileName!: string;
  teamId!: string;
  size!: number;
  mimeType!: string;
  status!: FileStatus;
  metadata?: FileMetadata;
  parentFolderId?: string | null;
  uploadedBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
