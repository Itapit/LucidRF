import { FileDto } from '@LucidRF/common';

/**
 * Response returned after confirming a file upload.
 */
export class ConfirmUploadResponseDto {
  /**
   * The updated file metadata.
   */
  file: FileDto;

  /**
   * Status of the operation.
   * @example "uploaded"
   */
  status: string;
}
