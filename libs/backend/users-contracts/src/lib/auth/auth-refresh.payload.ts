import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthRefreshPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  jti!: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
