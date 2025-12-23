import { FileDto } from '../../domain/dtos/file.dto';
import { FolderDto } from '../../domain/dtos/folder.dto';

export interface UnshareResourceResponse {
  success: boolean;
  resource: FileDto | FolderDto;
}
