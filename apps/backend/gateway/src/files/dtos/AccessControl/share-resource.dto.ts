import { PermissionRole, PermissionType, ShareResourceRequest } from '@LucidRF/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ShareResourceDto implements ShareResourceRequest {
  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @IsEnum(PermissionType)
  @IsNotEmpty()
  subjectType!: PermissionType;

  @IsEnum(PermissionRole)
  @IsNotEmpty()
  role!: PermissionRole;
}
