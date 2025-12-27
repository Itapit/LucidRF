import { IsResourceId } from '@LucidRF/backend-common';
import { PermissionType, UnshareResourceRequest } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UnshareResourceDto implements UnshareResourceRequest {
  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;

  @IsNotEmpty()
  @IsResourceId()
  subjectId!: string;

  @IsNotEmpty()
  @IsEnum(PermissionType)
  subjectType!: PermissionType;
}
