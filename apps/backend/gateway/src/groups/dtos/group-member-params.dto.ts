import { IsMongoId } from 'class-validator';
import { GroupIdParamsDto } from './group-id.dto';

export class GroupMemberParamsDto extends GroupIdParamsDto {
  @IsMongoId()
  userId: string;
}
