import { TeamColor, TeamDto, TeamRole, TeamType } from '@LucidRF/common';
import {
  AddMemberPayload,
  CheckTeamMembershipPayload,
  CreateTeamPayload,
  DeleteTeamPayload,
  FindOneTeamPayload,
  GetUserTeamsPayload,
  RemoveMemberPayload,
  UpdateTeamPayload,
} from '@LucidRF/teams-contracts';
import { Injectable } from '@nestjs/common';
import { InvalidTeamOperationException, TeamNotFoundException, TeamPermissionDeniedException } from './exceptions';
import { CreateTeamRepoDto } from './repository/create-team-repo.dto';
import { TeamRepository } from './repository/team.repository';
import { TeamSchema } from './repository/team.schema';

@Injectable()
export class TeamsService {
  constructor(private readonly teamRepository: TeamRepository) {}

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
    if (!actorMembership || (actorMembership.role !== TeamRole.OWNER && actorMembership.role !== TeamRole.MANAGER)) {
      throw new TeamPermissionDeniedException('Only the team owner or managers can add members');
    }

    if (actorMembership.role === TeamRole.MANAGER && payload.role !== TeamRole.MEMBER) {
      throw new TeamPermissionDeniedException('Managers can only add regular members');
    }

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
      if (actorMembership.role === TeamRole.MEMBER) {
        throw new TeamPermissionDeniedException('Members cannot remove other members');
      }
      if (actorMembership.role === TeamRole.MANAGER && targetMembership.role !== TeamRole.MEMBER) {
        throw new TeamPermissionDeniedException('Managers can only remove regular members');
      }
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
    if (!actorMembership || (actorMembership.role !== TeamRole.OWNER && actorMembership.role !== TeamRole.MANAGER)) {
      throw new TeamPermissionDeniedException('Only the owner or managers can update team details');
    }

    if (payload.color && actorMembership.role !== TeamRole.OWNER) {
      throw new TeamPermissionDeniedException('Only the owner can update the team color');
    }

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
   * Delete a team.
   */
  async delete(payload: DeleteTeamPayload): Promise<boolean> {
    const team = await this.findOne({ teamId: payload.teamId });

    const actorMembership = team.members.find((m) => m.userId === payload.actorId);
    if (!actorMembership || actorMembership.role !== TeamRole.OWNER) {
      throw new TeamPermissionDeniedException('Only the owner can delete the team');
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
