import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty } from 'class-validator';

export class GetUserByIdPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;
}
