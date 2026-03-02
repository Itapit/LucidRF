import { AdminCreateUserRequest, SystemRole } from '@LucidRF/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AdminCreateUserDto implements AdminCreateUserRequest {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  username: string;

  @IsEnum(SystemRole)
  role: SystemRole;
}
