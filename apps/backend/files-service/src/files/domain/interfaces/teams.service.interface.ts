export abstract class TeamsService {
  /**
   * Retrieves the list of Team IDs that a specific user belongs to.
   * This is used to calculate permissions.
   */
  abstract getUserTeamIds(userId: string): Promise<string[]>;
}
