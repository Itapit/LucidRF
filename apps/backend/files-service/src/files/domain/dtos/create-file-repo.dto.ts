import { FileStatus } from '@LucidRF/common';

export class CreateFileRepoDto {
  originalFileName: string;
  teamId: string;
  size: number;
  mimeType: string;
  status: FileStatus;
  storageKey: string;
  bucket: string;
  parentFolderId: string | null;
}
