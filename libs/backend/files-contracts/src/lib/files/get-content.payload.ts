import { IsResourceId } from '@LucidRF/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetContentPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsOptional()
  @IsResourceId()
  folderId!: string;
}
