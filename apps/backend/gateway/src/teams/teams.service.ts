import { TeamDto } from '@LucidRF/common';
import {
  AddMemberPayload,
  CreateTeamPayload,
  DeleteTeamPayload,
  RemoveMemberPayload,
  TEAMS_PATTERNS,
  TEAMS_SERVICE,
  UpdateTeamPayload,
} from '@LucidRF/teams-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AddMemberDto, CreateTeamDto, UpdateTeamDto } from './dtos';

@Injectable()
export class TeamsService {
  constructor(@Inject(TEAMS_SERVICE) private readonly teamsClient: ClientProxy) {}

  async create(dto: CreateTeamDto, ownerId: string): Promise<TeamDto> {
    const payload: CreateTeamPayload = {
      name: dto.name,
      description: dto.description,
      ownerId,
      type: dto.type,
    };
    return firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.CREATE, payload));
  }

  async findByUser(userId: string): Promise<TeamDto[]> {
    return firstValueFrom(this.teamsClient.send<TeamDto[]>(TEAMS_PATTERNS.GET_USER_TEAMS, userId));
  }

  async findOne(id: string): Promise<TeamDto> {
    return firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.FIND_ONE, id));
  }

  async update(teamId: string, userId: string, dto: UpdateTeamDto): Promise<TeamDto> {
    const payload: UpdateTeamPayload = {
      teamId,
      actorId: userId,
      name: dto.name,
      description: dto.description,
    };
    return firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.UPDATE, payload));
  }

  async addMember(teamId: string, userId: string, dto: AddMemberDto): Promise<TeamDto> {
    const payload: AddMemberPayload = {
      teamId,
      actorId: userId,
      targetUserId: dto.targetUserId,
      role: dto.role,
    };
    return firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.ADD_MEMBER, payload));
  }

  async removeMember(teamId: string, userId: string, targetUserId: string): Promise<TeamDto> {
    const payload: RemoveMemberPayload = {
      teamId,
      actorId: userId,
      targetUserId,
    };
    return firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.REMOVE_MEMBER, payload));
  }

  async delete(teamId: string, userId: string): Promise<boolean> {
    const payload: DeleteTeamPayload = {
      teamId,
      actorId: userId,
    };
    return firstValueFrom(this.teamsClient.send<boolean>(TEAMS_PATTERNS.DELETE, payload));
  }
}
