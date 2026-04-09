import { TeamColor } from './team-color.enum';

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  color?: TeamColor;
}
