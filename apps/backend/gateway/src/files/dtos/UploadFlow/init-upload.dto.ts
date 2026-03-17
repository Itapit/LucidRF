import { IsResourceId } from '@LucidRF/backend-common';
import { InitUploadRequest } from '@LucidRF/common';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InitUploadDto implements InitUploadRequest {
  /**
   * Original name of the file being uploaded
   * @example 'document.pdf'
   */
  @IsNotEmpty()
  @IsString()
  originalFileName!: string;

  /**
   * Size of the file in bytes
   * @example 1024
   */
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  size!: number;

  /**
   * MIME type of the file
   * @example 'application/pdf'
   */
  @IsNotEmpty()
  @IsString()
  mimeType!: string;

  /**
   * ID of the team that will own the file
   */
  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

  /**
   * ID of the parent folder (optional)
   */
  @IsOptional()
  @IsResourceId()
  parentFolderId?: string;
}
