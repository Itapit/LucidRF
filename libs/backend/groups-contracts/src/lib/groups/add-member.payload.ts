import { IsResourceId } from '@LucidRF/backend-common';
import { IsNotEmpty } from 'class-validator';

export class AddMemberPayload {
  @IsNotEmpty()
  @IsResourceId()
  groupId!: string;

  @IsNotEmpty()
  @IsResourceId()
  targetUserId!: string; // The user being added

  @IsNotEmpty()
  @IsResourceId()
  actorId!: string; // The user performing the action
}
