import { TeamRole, TeamType } from '@LucidRF/common';

export class CreateTeamRepoDto {
  name: string;
  description?: string;
  type: TeamType;
  members: {
    userId: string;
    role: TeamRole;
  }[];
}
