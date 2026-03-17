import { IsResourceId } from '@LucidRF/backend-common';
import { CreateFolderRequest } from '@LucidRF/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto implements CreateFolderRequest {
  /**
   * Name of the folder to create
   * @example 'Reports'
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * ID of the team that owns the folder
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
