import { IsResourceId } from '@LucidRF/backend-common';
import { ListContentRequest } from '@LucidRF/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class ListContentDto implements ListContentRequest {
  /**
   * ID of the team whose content to list
   */
  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

  /**
   * ID of the folder to list content from (optional)
   */
  @IsOptional()
  @IsResourceId()
  folderId?: string;
}
