import { IsResourceId, PermissionRole, PermissionType, ShareResourceRequest } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ShareResourceDto implements ShareResourceRequest {
  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;

  @IsNotEmpty()
  @IsResourceId()
  subjectId!: string;

  @IsNotEmpty()
  @IsEnum(PermissionType)
  subjectType!: PermissionType;

  @IsNotEmpty()
  @IsEnum(PermissionRole)
  role!: PermissionRole;
}
