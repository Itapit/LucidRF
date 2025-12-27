import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty } from 'class-validator';

export class RemoveMemberPayload {
  @IsNotEmpty()
  @IsResourceId()
  groupId!: string;

  @IsNotEmpty()
  @IsResourceId()
  targetUserId!: string; // The user being removed

  @IsNotEmpty()
  @IsResourceId()
  actorId!: string; // The user performing the action
}
