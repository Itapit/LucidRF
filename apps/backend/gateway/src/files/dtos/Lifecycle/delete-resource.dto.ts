import { DeleteResourceRequest } from '@LucidRF/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteResourceDto implements DeleteResourceRequest {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
