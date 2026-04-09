import { CreateUserRequest, SystemRole } from '@LucidRF/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto implements CreateUserRequest {
  /**
   * User's email address
   * @example 'newuser@example.com'
   */
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  /**
   * Unique username for the user
   * @example 'johndoe'
   */
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  username: string;

  /**
   * System-level role assigned to the user
   */
  @IsEnum(SystemRole)
  role: SystemRole;
}
