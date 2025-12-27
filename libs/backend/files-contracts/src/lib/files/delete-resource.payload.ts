import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty } from 'class-validator';

export class DeleteResourcePayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string; // File ID or Folder ID
}
