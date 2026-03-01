import { TeamType } from '@LucidRF/common';
import { TeamMemberSchema } from './team.schema';

export class CreateTeamRepoDto {
  name: string;
  description?: string;
  type: TeamType;
  members: TeamMemberSchema[];
}
