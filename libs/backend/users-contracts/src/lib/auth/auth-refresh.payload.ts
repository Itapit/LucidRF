import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthRefreshPayload {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  jti!: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
