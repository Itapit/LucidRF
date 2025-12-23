import { IsNotEmpty, IsString } from 'class-validator';

export class GetDownloadUrlPayload {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  resourceId!: string;
}
