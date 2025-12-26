import { InitUploadRequest, IsResourceId } from '@LucidRF/common';
import { IsMimeType, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InitUploadDto implements InitUploadRequest {
  @IsNotEmpty()
  @IsString()
  originalFileName!: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  size!: number;

  @IsMimeType()
  @IsNotEmpty()
  mimeType!: string;

  @IsOptional()
  @IsResourceId()
  parentFolderId?: string;
}
