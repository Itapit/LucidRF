import { IsResourceId } from '@LucidRF/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsResourceId()
  parentFolderId?: string | null;
}
