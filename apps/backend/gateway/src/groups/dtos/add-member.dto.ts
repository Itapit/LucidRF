import { AddMemberRequest } from '@limbo/common';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddMemberDto implements AddMemberRequest {
  @IsMongoId()
  @IsNotEmpty()
  targetUserId: string;
}
