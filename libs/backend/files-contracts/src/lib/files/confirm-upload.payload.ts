import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmUploadPayload {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  fileId!: string;

  @IsBoolean()
  @IsNotEmpty()
  success!: boolean;
}
