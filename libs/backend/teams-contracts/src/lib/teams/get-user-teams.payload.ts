import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty } from 'class-validator';

export class GetUserTeamsPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;
}
