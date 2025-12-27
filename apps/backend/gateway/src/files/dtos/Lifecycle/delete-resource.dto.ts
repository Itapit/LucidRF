import { IsResourceId } from '@LucidRF/backend-common';
import { DeleteResourceRequest } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class DeleteResourceDto implements DeleteResourceRequest {
  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;
}
