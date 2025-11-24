import { IsMongoId } from 'class-validator';

export class GroupIdParamsDto {
  @IsMongoId({ message: 'Invalid Group ID format' })
  groupId: string;
}
