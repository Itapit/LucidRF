import { TeamRole } from '@LucidRF/common';
import { CreateTeamRepoDto } from './create-team-repo.dto';
import { TeamSchema } from './team.schema';

export abstract class TeamRepository {
  abstract create(params: CreateTeamRepoDto): Promise<TeamSchema>;

  abstract findById(id: string): Promise<TeamSchema | null>;

  abstract findByName(name: string): Promise<TeamSchema | null>;

  /**
   * Finds all teams where the user is listed in the 'members' array
   */
  abstract findByMemberId(userId: string): Promise<TeamSchema[]>;

  /**
   * Updates basic info (name/description).
   * Returns null if team not found.
   */
  abstract update(id: string, updateData: Partial<TeamSchema>): Promise<TeamSchema | null>;

  /**
   * adds a user to the members array.
   */
  abstract addMember(teamId: string, userId: string, role: TeamRole): Promise<TeamSchema | null>;

  /**
   * removes a user from the members array.
   */
  abstract removeMember(teamId: string, userId: string): Promise<TeamSchema | null>;

  abstract delete(id: string): Promise<boolean>;

  /**
   * checks existence without fetching the whole document.
   */
  abstract isUserInTeam(teamId: string, userId: string): Promise<boolean>;
}
