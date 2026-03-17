import { IsResourceId } from '@LucidRF/backend-common';
import { GetDownloadUrlRequest } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class GetDownloadUrlDto implements GetDownloadUrlRequest {
  /**
   * ID of the file to download
   */
  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;
}
