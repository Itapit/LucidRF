import { DeleteResourceRequest, IsResourceId } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class DeleteResourceDto implements DeleteResourceRequest {
  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;
}
