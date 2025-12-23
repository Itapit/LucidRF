export abstract class GroupsService {
  /**
   * Retrieves the list of Group IDs that a specific user belongs to.
   * This is used to calculate inherited permissions.
   */
  abstract getUserGroupIds(userId: string): Promise<string[]>;
}
