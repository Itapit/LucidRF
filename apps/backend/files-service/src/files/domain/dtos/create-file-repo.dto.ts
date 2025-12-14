import { FileStatus } from '@limbo/common';
import { Permission } from '../permission.entity';

export class CreateFileRepoDto {
  originalFileName: string;
  ownerId: string;
  size: number;
  mimeType: string;
  status: FileStatus;
  storageKey: string;
  bucket: string;
  parentFolderId: string | null;
  permissions: Permission[];
}
