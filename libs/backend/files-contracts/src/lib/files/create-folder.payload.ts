import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderPayload {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
