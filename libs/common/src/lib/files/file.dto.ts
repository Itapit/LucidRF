import { FileStatus } from './file-status.enum';

export class FileDto {
  id!: string;
  originalName!: string;
  mimeType?: string;
  size?: number;
  status!: FileStatus;
  ownerId!: string;
  isFolder!: boolean;
  parentId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
