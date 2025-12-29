import { LoginRequest } from '@LucidRF/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto implements LoginRequest {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
