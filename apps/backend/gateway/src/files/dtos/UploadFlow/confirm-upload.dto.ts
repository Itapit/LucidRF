import { ConfirmUploadRequest } from '@LucidRF/common';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmUploadDto implements ConfirmUploadRequest {
  @IsString()
  @IsNotEmpty()
  fileId!: string;

  @IsBoolean()
  @IsNotEmpty()
  success!: boolean;
}
