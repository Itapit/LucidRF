import { IsResourceId } from '@LucidRF/backend-common';

export class TeamIdParamsDto {
  /**
   * Unique ID of the team
   */
  @IsResourceId()
  teamId: string;
}
