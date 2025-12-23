import { CreateFolderRequest } from '@LucidRF/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto implements CreateFolderRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  parentFolderId?: string;
}
