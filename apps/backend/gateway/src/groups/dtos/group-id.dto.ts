import { IsResourceId } from '@LucidRF/common';

export class GroupIdParamsDto {
  @IsResourceId()
  groupId: string;
}
