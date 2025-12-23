import { FileStatus } from '@LucidRF/common';
import { PermissionEntity } from '../entities';

export class CreateFileRepoDto {
  originalFileName: string;
  ownerId: string;
  size: number;
  mimeType: string;
  status: FileStatus;
  storageKey: string;
  bucket: string;
  parentFolderId: string | null;
  permissions: PermissionEntity[];
}
