import { GetDownloadUrlRequest, IsResourceId } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class GetDownloadUrlDto implements GetDownloadUrlRequest {
  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;
}
