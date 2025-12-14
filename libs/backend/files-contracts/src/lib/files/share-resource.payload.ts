import { PermissionRole, PermissionType } from '@limbo/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ShareResourcePayload {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsEnum(PermissionRole)
  @IsNotEmpty()
  role!: PermissionRole;

  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @IsEnum(PermissionType)
  @IsNotEmpty()
  subjectType!: PermissionType;
}
