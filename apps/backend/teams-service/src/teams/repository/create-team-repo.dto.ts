import { TeamColor, TeamRole, TeamType } from '@LucidRF/common';

export class CreateTeamRepoDto {
  name: string;
  description?: string;
  type: TeamType;
  color: TeamColor;
  initials: string;
  members: {
    userId: string;
    role: TeamRole;
  }[];
}
