export class FolderEntity {
  id: string;
  name: string;
  teamId: string;

  // Hierarchy
  parentFolderId?: string | null;

  createdBy: string;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<FolderEntity>) {
    Object.assign(this, partial);
  }
}
