import { ListContentRequest } from '@LucidRF/common';
import { IsOptional, IsString } from 'class-validator';

export class ListContentDto implements ListContentRequest {
  @IsString()
  @IsOptional()
  folderId?: string;
}
