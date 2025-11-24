import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CheckGroupMembershipPayload {
  @IsNotEmpty()
  @IsMongoId()
  userId!: string;

  @IsNotEmpty()
  @IsMongoId()
  groupId!: string;
}
