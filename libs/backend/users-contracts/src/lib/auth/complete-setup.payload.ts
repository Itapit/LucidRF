import { IsResourceId } from '@LucidRF/common';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CompleteSetupPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
