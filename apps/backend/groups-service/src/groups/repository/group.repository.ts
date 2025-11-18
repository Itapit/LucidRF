import { CreateGroupRepoDto } from './create-group-repo.dto';
import { GroupSchema } from './group.schema';

export abstract class GroupRepository {
  abstract create(params: CreateGroupRepoDto): Promise<GroupSchema>;

  abstract findById(id: string): Promise<GroupSchema | null>;

  /**
   * Finds all groups where the user is listed in the 'members' array
   */
  abstract findByMemberId(userId: string): Promise<GroupSchema[]>;

  /**
   * Updates basic info (name/description).
   * Returns null if group not found.
   */
  abstract update(id: string, updateData: Partial<GroupSchema>): Promise<GroupSchema | null>;

  /**
   * adds a user to the members array.
   */
  abstract addMember(groupId: string, userId: string): Promise<GroupSchema | null>;

  /**
   * removes a user from the members array.
   */
  abstract removeMember(groupId: string, userId: string): Promise<GroupSchema | null>;

  abstract delete(id: string): Promise<boolean>;

  /**
   * checks existence without fetching the whole document.
   */
  abstract isUserInGroup(groupId: string, userId: string): Promise<boolean>;
}
