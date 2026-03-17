import { FileDto } from '@LucidRF/common';

/**
 * Response returned after initializing a file upload.
 */
export class InitUploadResponseDto {
  /**
   * The file metadata record created in the system.
   */
  file: FileDto;

  /**
   * The signed S3 URL used to upload the file content directly.
   * @example "https://s3.amazonaws.com/bucket/file-uuid?signature=..."
   */
  uploadUrl: string;
}
