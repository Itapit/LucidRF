import { IsResourceId } from '@LucidRF/backend-common';
import { ListContentRequest } from '@LucidRF/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class ListContentDto implements ListContentRequest {
  @IsNotEmpty()
  @IsResourceId()
  teamId!: string;

  @IsOptional()
  @IsResourceId()
  folderId?: string;
}
