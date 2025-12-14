import { CompleteSetupRequest } from '@LucidRF/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CompleteSetupDto implements CompleteSetupRequest {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsNotEmpty()
  password!: string;
}
