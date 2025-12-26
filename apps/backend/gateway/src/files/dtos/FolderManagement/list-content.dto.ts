import { IsResourceId, ListContentRequest } from '@LucidRF/common';
import { IsOptional } from 'class-validator';

export class ListContentDto implements ListContentRequest {
  @IsOptional()
  @IsResourceId()
  folderId?: string;
}
