import { GetDownloadUrlRequest } from '@LucidRF/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetDownloadUrlDto implements GetDownloadUrlRequest {
  @IsString()
  @IsNotEmpty()
  resourceId!: string;
}
