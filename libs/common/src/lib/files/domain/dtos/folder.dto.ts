export class FolderDto {
  resourceId!: string;
  name!: string;
  teamId!: string;
  parentFolderId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
