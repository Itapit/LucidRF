import { IsResourceId } from '@LucidRF/backend-common';
import { UserRole } from '@LucidRF/common';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AdminCreateUserPayload {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsNotEmpty()
  @IsResourceId()
  adminId!: string;
}
