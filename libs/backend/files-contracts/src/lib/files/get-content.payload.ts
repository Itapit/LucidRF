import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetContentPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsOptional()
  @IsResourceId()
  folderId!: string;
}
