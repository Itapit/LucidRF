import { IsResourceId } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class GetDownloadUrlPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;
}
