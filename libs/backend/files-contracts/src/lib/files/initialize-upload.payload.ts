import { IsResourceId } from '@LucidRF/common';
import { IsMimeType, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitializeUploadPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  originalFileName!: string;

  @IsNotEmpty()
  @IsNumber()
  size!: number;

  @IsNotEmpty()
  @IsMimeType()
  mimeType!: string;

  @IsOptional()
  @IsResourceId()
  parentFolderId?: string;
}
