import { FileStatus } from './file-status.enum';

export class FileDto {
  id!: string;
  originalFileName!: string;
  mimeType!: string;
  size!: number;
  status!: FileStatus;
  ownerId!: string;
  parentFolderId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
