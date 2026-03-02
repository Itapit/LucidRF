import { BasicUserDto } from '../users/basic-user.dto';
import { TeamRole } from './team-role.enum';

export class TeamMemberDto {
  userId!: string;
  role!: TeamRole;
  user?: BasicUserDto;
}
