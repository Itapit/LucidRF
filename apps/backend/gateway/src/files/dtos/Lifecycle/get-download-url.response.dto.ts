/**
 * Response containing a download URL for a file.
 */
export class GetDownloadUrlResponseDto {
  /**
   * The temporary, signed URL for downloading the file.
   * @example "https://s3.amazonaws.com/bucket/file-uuid?signature=..."
   */
  url: string;
}
