import { IsResourceId } from '@LucidRF/backend-common';
import { GroupIdParamsDto } from './group-id.dto';

export class GroupMemberParamsDto extends GroupIdParamsDto {
  @IsResourceId()
  userId: string;
}
