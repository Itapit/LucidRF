import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthLoginPayload {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
