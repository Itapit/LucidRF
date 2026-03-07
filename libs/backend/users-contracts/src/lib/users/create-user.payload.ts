import { IsResourceId } from '@LucidRF/backend-common';
import { SystemRole } from '@LucidRF/common';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserPayload {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEnum(SystemRole)
  role!: SystemRole;

  @IsNotEmpty()
  @IsResourceId()
  adminId!: string;
}
