import { TeamRole } from './team-role.enum';

export interface AddMemberRequest {
  targetUserId: string;
  role: TeamRole;
}
