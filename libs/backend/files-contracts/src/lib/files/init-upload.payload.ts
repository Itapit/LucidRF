import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InitUploadPayload {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  mimetype!: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
