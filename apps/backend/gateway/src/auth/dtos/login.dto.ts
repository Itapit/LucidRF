import { LoginRequest } from '@LucidRF/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto implements LoginRequest {
  /**
   * User's email address
   * @example 'user@example.com'
   */
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email!: string;

  /**
   * User's password
   * @example 'P@ssword123'
   */
  @IsString()
  @IsNotEmpty()
  password!: string;
}
