import { FileStatus } from '../enums/file-status.enum';
import { PermissionDto } from './permission.dto';

export class FileDto {
  resourceId!: string;
  originalFileName!: string;
  ownerId!: string;
  size!: number;
  mimeType!: string;
  status!: FileStatus;
  parentFolderId?: string | null;
  permissions!: PermissionDto[];
  createdAt!: Date;
  updatedAt!: Date;
}
