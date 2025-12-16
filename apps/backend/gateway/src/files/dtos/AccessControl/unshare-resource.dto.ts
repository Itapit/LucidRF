import { PermissionType, UnshareResourceRequest } from '@LucidRF/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UnshareResourceDto implements UnshareResourceRequest {
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
