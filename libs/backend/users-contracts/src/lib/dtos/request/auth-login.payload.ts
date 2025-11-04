import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginPayload {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
