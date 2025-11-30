import { FileStatus } from '@limbo/common';

export class CreateFileRepoDto {
  key?: string;
  originalName: string;
  mimeType?: string;
  ownerId: string;
  status: FileStatus;
  isFolder: boolean;
  parentId?: string | null;
  size?: number;
}
