import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteResourcePayload {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  resourceId!: string; // File ID or Folder ID
}
