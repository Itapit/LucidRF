export interface CreateFolderRequest {
  name: string;
  teamId: string;
  parentFolderId?: string;
}
