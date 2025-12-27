import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty } from 'class-validator';

export class CheckGroupMembershipPayload {
  @IsNotEmpty()
  @IsResourceId()
  userId!: string;

  @IsNotEmpty()
  @IsResourceId()
  groupId!: string;
}
