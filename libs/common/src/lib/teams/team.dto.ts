import { TeamMemberDto } from './team-member.dto';
import { TeamType } from './team-type.enum';

export class TeamDto {
  id!: string;
  name!: string;
  description?: string;
  type!: TeamType;
  members!: TeamMemberDto[];
  createdAt!: Date;
  updatedAt!: Date;
}
