import { FileDto, FolderDto } from '@LucidRF/common';

/**
 * Response containing the contents of a folder.
 */
export class ListContentResponseDto {
  /**
   * List of files in the folder.
   */
  files: FileDto[];

  /**
   * List of subfolders in the folder.
   */
  folders: FolderDto[];
}
