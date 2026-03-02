import { IsResourceId } from '@LucidRF/backend-common';

export class TeamIdParamsDto {
  @IsResourceId()
  teamId: string;
}
