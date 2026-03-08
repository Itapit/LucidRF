import { FileStatus } from '../enums/file-status.enum';

export class FileDto {
  resourceId!: string;
  originalFileName!: string;
  teamId!: string;
  size!: number;
  mimeType!: string;
  status!: FileStatus;
  parentFolderId?: string | null;
  uploadedBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
