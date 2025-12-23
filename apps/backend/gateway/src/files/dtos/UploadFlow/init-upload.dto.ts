import { InitUploadRequest } from '@LucidRF/common';
import { IsMimeType, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InitUploadDto implements InitUploadRequest {
  @IsString()
  @IsNotEmpty()
  originalFileName!: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  size!: number;

  @IsMimeType()
  @IsNotEmpty()
  mimeType!: string;

  @IsString()
  @IsOptional()
  parentFolderId?: string;
}
