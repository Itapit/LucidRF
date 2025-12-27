import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty } from 'class-validator';

export class AuthLogoutAllPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;
}
