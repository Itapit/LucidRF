import { FileDto } from '../../domain/dtos/file.dto';
import { FolderDto } from '../../domain/dtos/folder.dto';

export interface ListContentResponse {
  files: FileDto[];
  folders: FolderDto[];
}
