import { FileStatus } from '@limbo/common';

export class FileEntity {
  id: string;
  key?: string;
  originalName: string;
  mimeType?: string;
  ownerId: string;
  status: FileStatus;
  isFolder: boolean;
  parentId?: string | null;
  size?: number;
  sharedWithUsers: string[];
  sharedWithGroups: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<FileEntity>) {
    Object.assign(this, props);
  }
}
