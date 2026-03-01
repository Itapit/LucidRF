import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitializeUploadPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

  @IsNotEmpty()
  @IsString()
  originalFileName!: string;

  @IsNotEmpty()
  @IsNumber()
  size!: number;

  @IsNotEmpty()
  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsResourceId()
  parentFolderId?: string;
}
