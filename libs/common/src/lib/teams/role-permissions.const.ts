import { TeamPermission } from './team-permission.enum';
import { TeamRole } from './team-role.enum';

export const RolePermissions: Record<TeamRole, TeamPermission[]> = {
  [TeamRole.OWNER]: [
    TeamPermission.UPDATE_TEAM_DETAILS,
    TeamPermission.DELETE_TEAM,
    TeamPermission.ADD_MEMBER,
    TeamPermission.ADD_MANAGER,
    TeamPermission.ADD_OWNER,
    TeamPermission.REMOVE_MEMBER,
    TeamPermission.REMOVE_MANAGER,
    TeamPermission.REMOVE_OWNER,
    TeamPermission.PROMOTE_TO_MANAGER,
    TeamPermission.PROMOTE_TO_OWNER,
    TeamPermission.DEMOTE_MANAGER,
    TeamPermission.DEMOTE_OWNER,
  ],
  [TeamRole.MANAGER]: [
    TeamPermission.UPDATE_TEAM_DETAILS,
    TeamPermission.ADD_MEMBER,
    TeamPermission.REMOVE_MEMBER,
    TeamPermission.PROMOTE_TO_MANAGER,
    TeamPermission.DEMOTE_MANAGER,
  ],
  [TeamRole.MEMBER]: [],
};
