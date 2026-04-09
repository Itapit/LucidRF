export class FolderDto {
  resourceId!: string;
  name!: string;
  teamId!: string;
  parentFolderId?: string | null;
  createdBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
