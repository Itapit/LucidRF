import { IsResourceId } from '@LucidRF/backend-common';
import { DeleteResourceRequest } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class DeleteResourceDto implements DeleteResourceRequest {
  /**
   * ID of the resource (file or folder) to delete
   */
  @IsNotEmpty()
  @IsResourceId()
  resourceId!: string;
}
