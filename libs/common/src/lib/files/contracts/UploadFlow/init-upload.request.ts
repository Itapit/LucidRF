export interface InitUploadRequest {
  originalFileName: string;
  size: number;
  mimeType: string;
  teamId: string;
  parentFolderId?: string;
}
