import { FileDto } from '../../domain/dtos/file.dto';

export interface ConfirmUploadResponse {
  file: FileDto | null; // Null if upload failed and file was deleted
  status: string;
}
