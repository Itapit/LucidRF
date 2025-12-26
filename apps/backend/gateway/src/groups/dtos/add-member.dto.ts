import { AddMemberRequest, IsResourceId } from '@LucidRF/common';
import { IsNotEmpty } from 'class-validator';

export class AddMemberDto implements AddMemberRequest {
  @IsNotEmpty()
  @IsResourceId()
  targetUserId: string;
}
