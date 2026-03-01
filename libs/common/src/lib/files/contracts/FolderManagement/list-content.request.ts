export interface ListContentRequest {
  teamId: string;
  folderId?: string; // Optional: if undefined, list root
}
