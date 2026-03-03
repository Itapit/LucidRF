import { TeamColor } from './team-color.enum';
import { TeamMemberDto } from './team-member.dto';
import { TeamType } from './team-type.enum';

export class TeamDto {
  id!: string;
  name!: string;
  description?: string;
  type!: TeamType;
  color!: TeamColor;
  initials!: string;
  members!: TeamMemberDto[];
  createdAt!: Date;
  updatedAt!: Date;
}
