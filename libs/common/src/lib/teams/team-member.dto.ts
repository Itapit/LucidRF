import { TeamRole } from './team-role.enum';

export class TeamMemberDto {
  userId!: string;
  role!: TeamRole;
}
