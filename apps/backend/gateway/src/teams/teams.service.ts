import { TeamDto, UserDto } from '@LucidRF/common';
import {
  AddMemberPayload,
  CreateTeamPayload,
  DeleteTeamPayload,
  FindOneTeamPayload,
  GetUserTeamsPayload,
  RemoveMemberPayload,
  TEAMS_PATTERNS,
  TEAMS_SERVICE,
  UpdateTeamPayload,
} from '@LucidRF/teams-contracts';
import { USER_PATTERNS, USER_SERVICE } from '@LucidRF/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AddMemberDto, CreateTeamDto, UpdateTeamDto } from './dtos';

@Injectable()
export class TeamsService {
  constructor(
    @Inject(TEAMS_SERVICE) private readonly teamsClient: ClientProxy,
    @Inject(USER_SERVICE) private readonly usersClient: ClientProxy
  ) {}

  private async hydrateTeams<T extends TeamDto | TeamDto[]>(teams: T): Promise<T> {
    const teamsArray = Array.isArray(teams) ? teams : [teams];
    const validTeams = teamsArray.filter(Boolean);

    if (validTeams.length === 0) {
      return teams;
    }

    const uniqueUserIds = new Set<string>(
      validTeams
        .flatMap((team) => team.members || [])
        .map((member) => member.userId)
        .filter((userId): userId is string => !!userId)
    );

    if (uniqueUserIds.size === 0) {
      return teams;
    }

    const userIds = Array.from(uniqueUserIds);
    const users = await firstValueFrom(this.usersClient.send<UserDto[]>(USER_PATTERNS.GET_USERS_BY_IDS, { userIds }));

    const usersMap = new Map<string, UserDto>();
    for (const user of users) {
      if (user?.id) {
        usersMap.set(user.id, user);
      }
    }

    for (const team of validTeams) {
      for (const member of team.members || []) {
        const fullUser = member.userId ? usersMap.get(member.userId) : null;
        if (fullUser) {
          member.user = {
            id: fullUser.id,
            username: fullUser.username,
            email: fullUser.email,
          };
        }
      }
    }

    return teams;
  }

  async create(dto: CreateTeamDto, ownerId: string): Promise<TeamDto> {
    const payload: CreateTeamPayload = {
      name: dto.name,
      description: dto.description,
      ownerId,
      type: dto.type,
    };
    const team = await firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.CREATE, payload));
    return this.hydrateTeams(team);
  }

  async findByUser(userId: string): Promise<TeamDto[]> {
    const playload: GetUserTeamsPayload = {
      userId: userId,
    };
    const teams = await firstValueFrom(this.teamsClient.send<TeamDto[]>(TEAMS_PATTERNS.GET_USER_TEAMS, playload));
    return this.hydrateTeams(teams);
  }

  async findOne(id: string): Promise<TeamDto> {
    const playload: FindOneTeamPayload = {
      teamId: id,
    };
    const team = await firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.FIND_ONE, playload));
    return this.hydrateTeams(team);
  }

  async update(teamId: string, userId: string, dto: UpdateTeamDto): Promise<TeamDto> {
    const payload: UpdateTeamPayload = {
      teamId,
      actorId: userId,
      name: dto.name,
      description: dto.description,
    };
    const team = await firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.UPDATE, payload));
    return this.hydrateTeams(team);
  }

  async addMember(teamId: string, userId: string, dto: AddMemberDto): Promise<TeamDto> {
    const payload: AddMemberPayload = {
      teamId,
      actorId: userId,
      targetUserId: dto.targetUserId,
      role: dto.role,
    };
    const team = await firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.ADD_MEMBER, payload));
    return this.hydrateTeams(team);
  }

  async removeMember(teamId: string, userId: string, targetUserId: string): Promise<TeamDto> {
    const payload: RemoveMemberPayload = {
      teamId,
      actorId: userId,
      targetUserId,
    };
    const team = await firstValueFrom(this.teamsClient.send<TeamDto>(TEAMS_PATTERNS.REMOVE_MEMBER, payload));
    return this.hydrateTeams(team);
  }

  async delete(teamId: string, userId: string): Promise<boolean> {
    const payload: DeleteTeamPayload = {
      teamId,
      actorId: userId,
    };
    return firstValueFrom(this.teamsClient.send<boolean>(TEAMS_PATTERNS.DELETE, payload));
  }
}
