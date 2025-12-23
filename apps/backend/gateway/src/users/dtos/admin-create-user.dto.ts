import { AdminCreateUserRequest, UserRole } from '@LucidRF/common';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AdminCreateUserDto implements AdminCreateUserRequest {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(UserRole)
  role: UserRole;
}
