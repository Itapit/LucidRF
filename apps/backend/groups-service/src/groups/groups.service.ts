import { GroupDto } from '@LucidRF/common';
import {
  AddMemberPayload,
  CheckGroupMembershipPayload,
  CreateGroupPayload,
  DeleteGroupPayload,
  RemoveMemberPayload,
  UpdateGroupPayload,
} from '@LucidRF/groups-contracts';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  GroupNotFoundException,
  GroupPermissionDeniedException,
  InvalidGroupIdException,
  InvalidGroupOperationException,
} from './exceptions';
import { CreateGroupRepoDto } from './repository/create-group-repo.dto';
import { GroupRepository } from './repository/group.repository';
import { GroupSchema } from './repository/group.schema';

@Injectable()
export class GroupsService {
  constructor(private readonly groupRepository: GroupRepository) {}

  /**
   * Create a new group.
   */
  async create(payload: CreateGroupPayload): Promise<GroupDto> {
    const ownerObjectId = new Types.ObjectId(payload.ownerId); //TODO remove the moongoose dependency

    const repoParams: CreateGroupRepoDto = {
      name: payload.name,
      description: payload.description,
      ownerId: ownerObjectId,
      members: [ownerObjectId], // Owner is automatically a member
    };

    const group = await this.groupRepository.create(repoParams);
    return this.mapToDto(group);
  }

  /**
   * Find a specific group.
   */
  async findOne(id: string): Promise<GroupDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new InvalidGroupIdException(id);
    }

    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new GroupNotFoundException(id);
    }
    return this.mapToDto(group);
  }

  /**
   * Find all groups a user belongs to.
   */
  async findMyGroups(userId: string): Promise<GroupDto[]> {
    const groups = await this.groupRepository.findByMemberId(userId);
    return groups.map((group) => this.mapToDto(group));
  }

  /**
   * Add a member to a group.
   */
  async addMember(payload: AddMemberPayload): Promise<GroupDto> {
    const group = await this.findOne(payload.groupId);

    if (group.ownerId.toString() !== payload.actorId) {
      throw new GroupPermissionDeniedException('Only the group owner can add members');
    }

    const updatedGroup = await this.groupRepository.addMember(payload.groupId, payload.targetUserId);
    if (!updatedGroup) {
      throw new GroupNotFoundException(payload.groupId);
    }

    return this.mapToDto(updatedGroup);
  }

  /**
   * Remove a member from a group.
   */
  async removeMember(payload: RemoveMemberPayload): Promise<GroupDto> {
    const group = await this.findOne(payload.groupId);

    const isOwner = group.ownerId.toString() === payload.actorId;
    const isSelf = payload.targetUserId === payload.actorId;

    if (!isOwner && !isSelf) {
      throw new GroupPermissionDeniedException('Only the owner can remove other members');
    }

    if (isOwner && isSelf) {
      throw new InvalidGroupOperationException('Owner cannot remove themselves from the group');
    }

    const updatedGroup = await this.groupRepository.removeMember(payload.groupId, payload.targetUserId);
    if (!updatedGroup) {
      throw new GroupNotFoundException(payload.groupId);
    }
    return this.mapToDto(updatedGroup);
  }

  /**
   * Update group details.
   */
  async update(payload: UpdateGroupPayload): Promise<GroupDto> {
    const group = await this.findOne(payload.groupId);

    // Permission Check: Is the actor the owner?
    if (group.ownerId.toString() !== payload.actorId) {
      throw new GroupPermissionDeniedException('Only the owner can update group details');
    }

    // We pass the payload directly, as it matches Partial<Group> structure for name/desc
    const updated = await this.groupRepository.update(payload.groupId, {
      name: payload.name,
      description: payload.description,
    });

    if (!updated) {
      throw new GroupNotFoundException(payload.groupId);
    }
    return this.mapToDto(updated);
  }

  /**
   * Delete a group.
   */
  async delete(payload: DeleteGroupPayload): Promise<boolean> {
    const group = await this.findOne(payload.groupId);

    if (group.ownerId.toString() !== payload.actorId) {
      throw new GroupPermissionDeniedException('Only the owner can delete the group');
    }

    return this.groupRepository.delete(payload.groupId);
  }

  /**
   * Internal Microservice Helper
   */
  async isUserInGroup(payload: CheckGroupMembershipPayload): Promise<boolean> {
    if (!Types.ObjectId.isValid(payload.groupId) || !Types.ObjectId.isValid(payload.userId)) {
      return false;
    }
    return this.groupRepository.isUserInGroup(payload.groupId, payload.userId);
  }

  /**
   * Maps the Mongoose Document to the clean Shared DTO.
   * Converts ObjectIds to Strings.
   */
  private mapToDto(group: GroupSchema): GroupDto {
    return {
      id: group._id.toString(),
      name: group.name,
      description: group.description,
      ownerId: group.ownerId.toString(),
      members: group.members.map((memberId) => memberId.toString()),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }
}
