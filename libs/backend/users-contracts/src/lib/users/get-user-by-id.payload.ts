import { IsResourceId } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class GetUserByIdPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;
}
