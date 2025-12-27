import { IsResourceId } from '@LucidRF/backend-common';

export class GroupIdParamsDto {
  @IsResourceId()
  groupId: string;
}
