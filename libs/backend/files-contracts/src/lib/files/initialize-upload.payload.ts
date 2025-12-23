import { IsMimeType, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitializeUploadPayload {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  originalFileName!: string;

  @IsNumber()
  @IsNotEmpty()
  size!: number;

  @IsMimeType()
  @IsNotEmpty()
  mimeType!: string;

  @IsString()
  @IsOptional()
  parentFolderId?: string | null;
}
