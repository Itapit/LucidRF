import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderPayload {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  parentFolderId?: string | null;
}
