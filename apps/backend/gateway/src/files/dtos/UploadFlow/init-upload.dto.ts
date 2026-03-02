import { IsResourceId } from '@LucidRF/backend-common';
import { InitUploadRequest } from '@LucidRF/common';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InitUploadDto implements InitUploadRequest {
  @IsNotEmpty()
  @IsString()
  originalFileName!: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  size!: number;

  @IsNotEmpty()
  @IsString()
  mimeType!: string;

  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

  @IsOptional()
  @IsResourceId()
  parentFolderId?: string;
}
