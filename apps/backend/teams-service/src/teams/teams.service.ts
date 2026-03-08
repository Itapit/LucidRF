import { RolePermissions, TeamColor, TeamDto, TeamPermission, TeamRole, TeamType } from '@LucidRF/common';
import { FILES_PATTERNS, FILES_SERVICE } from '@LucidRF/files-contracts';
import {
  AddMemberPayload,
  CheckTeamMembershipPayload,
  CreateTeamPayload,
  DeleteTeamPayload,
  FindOneTeamPayload,
  GetUserTeamsPayload,
  RemoveMemberPayload,
  UpdateMemberRolePayload,
  UpdateTeamPayload,
} from '@LucidRF/teams-contracts';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InvalidTeamOperationException, TeamNotFoundException, TeamPermissionDeniedException } from './exceptions';
import { CreateTeamRepoDto } from './repository/create-team-repo.dto';
import { TeamRepository } from './repository/team.repository';
import { TeamSchema } from './repository/team.schema';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly teamRepository: TeamRepository,
    @Inject(FILES_SERVICE) private readonly filesClient: ClientProxy
  ) {}

  /**
   * Helper to strictly check an actor's role against static permissions
   */
  private enforcePermission(actorRole: TeamRole, requiredPermission: TeamPermission): void {
    const permissions = RolePermissions[actorRole] || [];
    if (!permissions.includes(requiredPermission)) {
      throw new TeamPermissionDeniedException(
        `Actor with role ${actorRole} does not have permission: ${requiredPermission}`
      );
    }
  }

  /**
   * Create a new team.
   */
  async create(payload: CreateTeamPayload): Promise<TeamDto> {
    const color = this.calculateColor(payload.name);
    const initials = this.calculateInitials(payload.name);

    const repoParams: CreateTeamRepoDto = {
      name: payload.name,
      description: payload.description,
      type: payload.type || TeamType.COLLABORATIVE,
      color,
      initials,
      members: [{ userId: payload.ownerId, role: TeamRole.OWNER }], // Owner is automatically a member
    };

    const team = await this.teamRepository.create(repoParams);
    return this.mapToDto(team);
  }

  /**
   * Find a specific team.
   */
  async findOne(payload: FindOneTeamPayload): Promise<TeamDto> {
    const team = await this.teamRepository.findById(payload.teamId);
    if (!team) {
      throw new TeamNotFoundException(payload.teamId);
    }
    return this.mapToDto(team);
  }

  /**
   * Find all teams a user belongs to.
   */
  async findMyTeams(payload: GetUserTeamsPayload): Promise<TeamDto[]> {
    const teams = await this.teamRepository.findByMemberId(payload.userId);
    return teams.map((team) => this.mapToDto(team));
  }

  /**
   * Add a member to a team.
   */
  async addMember(payload: AddMemberPayload): Promise<TeamDto> {
    const team = await this.findOne({ teamId: payload.teamId });

    const existingMember = team.members.find((m) => m.userId === payload.targetUserId);
    if (existingMember) {
      throw new InvalidTeamOperationException('User is already a member of this team');
    }

    const actorMembership = team.members.find((m) => m.userId === payload.actorId);
    if (!actorMembership) {
      throw new TeamPermissionDeniedException('Actor is not a member of this team');
    }

    let requiredPermission: TeamPermission;
    if (payload.role === TeamRole.OWNER) {
      requiredPermission = TeamPermission.ADD_OWNER;
    } else if (payload.role === TeamRole.MANAGER) {
      requiredPermission = TeamPermission.ADD_MANAGER;
    } else {
      requiredPermission = TeamPermission.ADD_MEMBER;
    }

    this.enforcePermission(actorMembership.role, requiredPermission);

    const updatedTeam = await this.teamRepository.addMember(payload.teamId, payload.targetUserId, payload.role);
    if (!updatedTeam) {
      throw new TeamNotFoundException(payload.teamId);
    }

    return this.mapToDto(updatedTeam);
  }

  /**
   * Remove a member from a team.
   */
  async removeMember(payload: RemoveMemberPayload): Promise<TeamDto> {
    const team = await this.findOne({ teamId: payload.teamId });

    const actorMembership = team.members.find((m) => m.userId === payload.actorId);
    const targetMembership = team.members.find((m) => m.userId === payload.targetUserId);

    if (!targetMembership) {
      throw new InvalidTeamOperationException('User is not a member of this team');
    }

    const isSelf = payload.targetUserId === payload.actorId;
    const isActorOwner = actorMembership?.role === TeamRole.OWNER;

    if (!isSelf) {
      if (!actorMembership) {
        throw new TeamPermissionDeniedException('Actor is not a member of this team');
      }

      let requiredPermission: TeamPermission;
      if (targetMembership.role === TeamRole.OWNER) {
        requiredPermission = TeamPermission.REMOVE_OWNER;
      } else if (targetMembership.role === TeamRole.MANAGER) {
        requiredPermission = TeamPermission.REMOVE_MANAGER;
      } else {
        requiredPermission = TeamPermission.REMOVE_MEMBER;
      }

      this.enforcePermission(actorMembership.role, requiredPermission);
    }

    if (isSelf && isActorOwner) {
      // Ideally we should check if they are the LAST owner, but for now we keep it simple
      // or allow it and risk team having no owner
      // Let's prevent it to be safe
      const ownerCount = team.members.filter((m) => m.role === TeamRole.OWNER).length;
      if (ownerCount <= 1) {
        throw new InvalidTeamOperationException('Last owner cannot remove themselves from the team');
      }
    }

    const updatedTeam = await this.teamRepository.removeMember(payload.teamId, payload.targetUserId);
    if (!updatedTeam) {
      throw new TeamNotFoundException(payload.teamId);
    }
    return this.mapToDto(updatedTeam);
  }

  /**
   * Update team details.
   */
  async update(payload: UpdateTeamPayload): Promise<TeamDto> {
    const team = await this.findOne({ teamId: payload.teamId });

    const actorMembership = team.members.find((m) => m.userId === payload.actorId);
    if (!actorMembership) {
      throw new TeamPermissionDeniedException('Actor is not a member of this team');
    }

    this.enforcePermission(actorMembership.role, TeamPermission.UPDATE_TEAM_DETAILS);

    const updateData: Partial<TeamSchema> = {
      name: payload.name,
      description: payload.description,
    };

    if (payload.name && payload.name !== team.name) {
      updateData.initials = this.calculateInitials(payload.name);
    }

    if (payload.color) {
      updateData.color = payload.color;
    }

    const updated = await this.teamRepository.update(payload.teamId, updateData);

    if (!updated) {
      throw new TeamNotFoundException(payload.teamId);
    }
    return this.mapToDto(updated);
  }

  /**
   * Update a member's role.
   */
  async updateMemberRole(payload: UpdateMemberRolePayload): Promise<TeamDto> {
    const team = await this.findOne({ teamId: payload.teamId });

    const actorMembership = team.members.find((m) => m.userId === payload.actorId);
    const targetMembership = team.members.find((m) => m.userId === payload.targetUserId);

    if (!targetMembership) {
      throw new InvalidTeamOperationException('User is not a member of this team');
    }

    if (!actorMembership) {
      throw new TeamPermissionDeniedException('Actor is not a member of this team');
    }

    const isSelf = payload.targetUserId === payload.actorId;

    if (isSelf) {
      // Allow self-demotion from Owner, but ensure there's at least one other Owner
      if (actorMembership.role === TeamRole.OWNER && payload.role !== TeamRole.OWNER) {
        const ownerCount = team.members.filter((m) => m.role === TeamRole.OWNER).length;
        if (ownerCount <= 1) {
          throw new InvalidTeamOperationException('Cannot demote the last owner of the team');
        }
      }
      // Self-demotion from Manager to Member is fine. Self-promotion shouldn't happen via this path normally,
      // but let's enforce role checks below anyway.
    }

    if (payload.role === targetMembership.role) {
      return team; // No change needed
    }

    let requiredPermission: TeamPermission;

    // Promoting TO a higher role
    if (payload.role === TeamRole.OWNER) {
      requiredPermission = TeamPermission.PROMOTE_TO_OWNER;
    } else if (payload.role === TeamRole.MANAGER && targetMembership.role === TeamRole.MEMBER) {
      requiredPermission = TeamPermission.PROMOTE_TO_MANAGER;
    }
    // Demoting FROM a higher role
    else if (targetMembership.role === TeamRole.OWNER) {
      requiredPermission = TeamPermission.DEMOTE_OWNER;
    } else if (targetMembership.role === TeamRole.MANAGER && payload.role === TeamRole.MEMBER) {
      requiredPermission = TeamPermission.DEMOTE_MANAGER;
    } else {
      throw new InvalidTeamOperationException('Invalid role transition');
    }

    this.enforcePermission(actorMembership.role, requiredPermission);

    const updatedTeam = await this.teamRepository.updateMemberRole(payload.teamId, payload.targetUserId, payload.role);
    if (!updatedTeam) {
      throw new TeamNotFoundException(payload.teamId);
    }
    return this.mapToDto(updatedTeam);
  }

  /**
   * Delete a team.
   */
  async delete(payload: DeleteTeamPayload): Promise<boolean> {
    const team = await this.findOne({ teamId: payload.teamId });

    const actorMembership = team.members.find((m) => m.userId === payload.actorId);
    if (!actorMembership) {
      throw new TeamPermissionDeniedException('Actor is not a member of this team');
    }

    this.enforcePermission(actorMembership.role, TeamPermission.DELETE_TEAM);

    try {
      this.logger.log(`Initiating file deletion for team ${payload.teamId}`);
      await firstValueFrom(this.filesClient.send(FILES_PATTERNS.DELETE_TEAM_FILES, { teamId: payload.teamId }));
    } catch (error) {
      this.logger.error(`Failed to delete files for team ${payload.teamId}`, error);
      // We could throw here, but maybe it's better to log it and proceed to delete the team anyway,
      // or we can fail the whole request. Let's fail it so it can be retried.
      throw new InvalidTeamOperationException('Could not delete team files, aborting team deletion');
    }

    return this.teamRepository.delete(payload.teamId);
  }

  /**
   * Internal Microservice Helper
   */
  async isUserInTeam(payload: CheckTeamMembershipPayload): Promise<boolean> {
    return this.teamRepository.isUserInTeam(payload.teamId, payload.userId);
  }

  /**
   * Orchestrates the deletion of a user's teams.
   * - Deletes the user's personal team.
   * - Deletes group teams where the user is the sole member.
   * - Removes the user from group teams.
   * - Promotes another member to Owner if the user was the sole Owner.
   */
  async handleUserDeletion(payload: { userId: string }): Promise<void> {
    const { userId } = payload;
    this.logger.log(`Handling team deletions for user ${userId}`);

    const teams = await this.teamRepository.findByMemberId(userId);

    for (const team of teams) {
      if (team.type === TeamType.PERSONAL) {
        // Delete personal team
        await this.delete({ teamId: team._id.toString(), actorId: userId });
        continue;
      }

      if (team.members.length === 1) {
        // User is the only member of this group team, delete it
        await this.delete({ teamId: team._id.toString(), actorId: userId });
        continue;
      }

      // If user is the only Owner, promote another member
      const userMembership = team.members.find((m) => m.userId.toString() === userId);
      const otherMembers = team.members.filter((m) => m.userId.toString() !== userId);
      const otherOwners = otherMembers.filter((m) => m.role === TeamRole.OWNER);

      if (userMembership?.role === TeamRole.OWNER && otherOwners.length === 0) {
        // Find the oldest/first available member to promote
        const memberToPromote = otherMembers[0];
        if (memberToPromote) {
          this.logger.log(
            `Promoting user ${memberToPromote.userId} to Owner in team ${team._id} as previous owner is deleted`
          );
          await this.teamRepository.updateMemberRole(
            team._id.toString(),
            memberToPromote.userId.toString(),
            TeamRole.OWNER
          );
        }
      }

      // Remove the user from the team
      this.logger.log(`Removing user ${userId} from team ${team._id}`);
      await this.teamRepository.removeMember(team._id.toString(), userId);
    }
  }

  /**
   * Calculate team initials from name
   */
  private calculateInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    } else if (words.length === 1 && words[0].length === 1) {
      return words[0].toUpperCase();
    }
    return 'TM'; // Fallback
  }

  /**
   * Calculate random preset color based on name hash
   */
  private calculateColor(name: string): TeamColor {
    const colors = Object.values(TeamColor);
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Make sure hash is positive
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  /**
   * Maps the Mongoose Document to the clean Shared DTO.
   * Converts ObjectIds to Strings.
   */
  private mapToDto(team: TeamSchema): TeamDto {
    return {
      id: team._id.toString(),
      name: team.name,
      description: team.description,
      type: team.type,
      color: team.color,
      initials: team.initials,
      members: team.members.map((m) => ({
        userId: m.userId.toString(),
        role: m.role,
      })),
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }
}
