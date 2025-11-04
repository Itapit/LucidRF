import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AuthRefreshPayload {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  version!: string;
}
