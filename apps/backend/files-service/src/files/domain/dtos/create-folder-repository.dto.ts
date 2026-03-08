export class CreateFolderRepoDto {
  name: string;
  teamId: string;
  parentFolderId: string | null;
  createdBy: string;
}
