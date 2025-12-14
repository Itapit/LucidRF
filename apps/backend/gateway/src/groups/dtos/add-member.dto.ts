import { AddMemberRequest } from '@LucidRF/common';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddMemberDto implements AddMemberRequest {
  @IsMongoId()
  @IsNotEmpty()
  targetUserId: string;
}
