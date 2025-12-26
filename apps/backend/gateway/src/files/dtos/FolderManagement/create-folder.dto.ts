import { CreateFolderRequest, IsResourceId } from '@LucidRF/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto implements CreateFolderRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsResourceId()
  parentFolderId?: string;
}
