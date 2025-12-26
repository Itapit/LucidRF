import { IsResourceId } from '@LucidRF/common';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ConfirmUploadPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsNotEmpty()
  @IsResourceId()
  fileId!: string;

  @IsBoolean()
  @IsNotEmpty()
  success!: boolean;
}
