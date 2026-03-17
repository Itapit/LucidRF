import { IsResourceId } from '@LucidRF/backend-common';
import { ConfirmUploadRequest } from '@LucidRF/common';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ConfirmUploadDto implements ConfirmUploadRequest {
  /**
   * ID of the file whose upload is being confirmed
   */
  @IsNotEmpty()
  @IsResourceId()
  fileId!: string;

  /**
   * Whether the upload was successful
   */
  @IsNotEmpty()
  @IsBoolean()
  success!: boolean;
}
