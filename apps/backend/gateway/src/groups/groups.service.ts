import { GroupDto } from '@limbo/common';
import {
  AddMemberPayload,
  CreateGroupPayload,
  DeleteGroupPayload,
  GROUPS_PATTERNS,
  GROUPS_SERVICE,
  RemoveMemberPayload,
  UpdateGroupPayload,
} from '@limbo/groups-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AddMemberDto, CreateGroupDto, UpdateGroupDto } from './dtos';

@Injectable()
export class GroupsService {
  constructor(@Inject(GROUPS_SERVICE) private readonly groupsClient: ClientProxy) {}

  async create(dto: CreateGroupDto, ownerId: string): Promise<GroupDto> {
    const payload: CreateGroupPayload = {
      name: dto.name,
      description: dto.description,
      ownerId,
    };
    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.CREATE, payload));
  }

  async findByUser(userId: string): Promise<GroupDto[]> {
    return firstValueFrom(this.groupsClient.send<GroupDto[]>(GROUPS_PATTERNS.FIND_MY_GROUPS, userId));
  }

  async findOne(id: string): Promise<GroupDto> {
    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.FIND_ONE, id));
  }

  async update(groupId: string, userId: string, dto: UpdateGroupDto): Promise<GroupDto> {
    const payload: UpdateGroupPayload = {
      groupId,
      actorId: userId,
      name: dto.name,
      description: dto.description,
    };
    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.UPDATE, payload));
  }

  async addMember(groupId: string, userId: string, dto: AddMemberDto): Promise<GroupDto> {
    const payload: AddMemberPayload = {
      groupId,
      actorId: userId,
      targetUserId: dto.targetUserId,
    };
    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.ADD_MEMBER, payload));
  }

  async removeMember(groupId: string, userId: string, targetUserId: string): Promise<GroupDto> {
    const payload: RemoveMemberPayload = {
      groupId,
      actorId: userId,
      targetUserId,
    };
    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.REMOVE_MEMBER, payload));
  }

  async delete(groupId: string, userId: string): Promise<boolean> {
    const payload: DeleteGroupPayload = {
      groupId,
      actorId: userId,
    };
    return firstValueFrom(this.groupsClient.send<boolean>(GROUPS_PATTERNS.DELETE, payload));
  }
}
