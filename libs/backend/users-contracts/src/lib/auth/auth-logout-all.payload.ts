import { IsResourceId } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class AuthLogoutAllPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;
}
