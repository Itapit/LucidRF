import { PermissionType } from '@limbo/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UnshareResourcePayload {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @IsEnum(PermissionType)
  @IsNotEmpty()
  subjectType!: PermissionType;
}
