import { TeamType } from './team-type.enum';

export interface CreateTeamRequest {
  name: string;
  description?: string;
  type?: TeamType;
}
