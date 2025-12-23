export interface InitUploadRequest {
  originalFileName: string;
  size: number;
  mimeType: string;
  parentFolderId?: string;
}
