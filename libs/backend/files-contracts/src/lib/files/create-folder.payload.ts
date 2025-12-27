import { IsResourceId } from '@LucidRF/backend-common';
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
