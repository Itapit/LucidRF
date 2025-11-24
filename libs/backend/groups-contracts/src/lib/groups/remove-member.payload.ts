import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RemoveMemberPayload {
  @IsNotEmpty()
  @IsMongoId()
  groupId!: string;

  @IsNotEmpty()
  @IsMongoId()
  targetUserId!: string; // The user being removed

  @IsNotEmpty()
  @IsMongoId()
  actorId!: string; // The user performing the action
}
