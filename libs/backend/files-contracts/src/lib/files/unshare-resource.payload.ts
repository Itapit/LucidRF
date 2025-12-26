import { IsResourceId, PermissionType } from '@LucidRF/common';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UnshareResourcePayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

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
