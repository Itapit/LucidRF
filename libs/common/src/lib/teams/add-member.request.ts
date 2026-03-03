import { TeamRole } from './team-role.enum';

export interface AddMemberRequest {
  identifier: string;
  role: TeamRole;
}
