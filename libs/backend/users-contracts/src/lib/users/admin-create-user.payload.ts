import { UserRole } from '@limbo/common';
import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AdminCreateUserPayload {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsMongoId()
  @IsNotEmpty()
  adminId!: string;
}
