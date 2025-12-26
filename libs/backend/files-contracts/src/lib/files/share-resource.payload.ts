import { IsResourceId, PermissionRole, PermissionType } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ShareResourcePayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;

  @IsNotEmpty()
  @IsEnum(PermissionRole)
  role!: PermissionRole;

  @IsNotEmpty()
  @IsResourceId()
  subjectId!: string;

  @IsNotEmpty()
  @IsEnum(PermissionType)
  subjectType!: PermissionType;
}
