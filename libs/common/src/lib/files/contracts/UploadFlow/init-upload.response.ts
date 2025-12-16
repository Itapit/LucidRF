import { FileDto } from '../../domain/dtos/file.dto';

export interface InitUploadResponse {
  file: FileDto;
  uploadUrl: string;
}
