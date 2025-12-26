import { ConfirmUploadRequest, IsResourceId } from '@LucidRF/common';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ConfirmUploadDto implements ConfirmUploadRequest {
  @IsNotEmpty()
  @IsResourceId()
  fileId!: string;

  @IsNotEmpty()
  @IsBoolean()
  success!: boolean;
}
