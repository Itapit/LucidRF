import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetContentPayload {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsOptional()
  folderId!: string | null;
}
