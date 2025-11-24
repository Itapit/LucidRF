import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddMemberPayload {
  @IsNotEmpty()
  @IsMongoId()
  groupId!: string;

  @IsNotEmpty()
  @IsMongoId()
  targetUserId!: string; // The user being added

  @IsNotEmpty()
  @IsMongoId()
  actorId!: string; // The user performing the action
}
