import { GroupDto } from '@limbo/common';
import {
  AddMemberPayload,
  CheckGroupMembershipPayload,
  CreateGroupPayload,
  DeleteGroupPayload,
  GROUPS_PATTERNS,
  RemoveMemberPayload,
  UpdateGroupPayload,
} from '@limbo/groups-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @MessagePattern(GROUPS_PATTERNS.CREATE)
  create(@Payload() payload: CreateGroupPayload): Promise<GroupDto> {
    // Payload contains: { name, description, ownerId }
    return this.groupsService.create(payload);
  }

  @MessagePattern(GROUPS_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string): Promise<GroupDto> {
    return this.groupsService.findOne(id);
  }

  @MessagePattern(GROUPS_PATTERNS.FIND_MY_GROUPS)
  findMyGroups(@Payload() userId: string): Promise<GroupDto[]> {
    return this.groupsService.findMyGroups(userId);
  }

  @MessagePattern(GROUPS_PATTERNS.UPDATE)
  update(@Payload() payload: UpdateGroupPayload): Promise<GroupDto> {
    // Payload contains: { groupId, actorId, name?, description? }
    return this.groupsService.update(payload);
  }

  @MessagePattern(GROUPS_PATTERNS.ADD_MEMBER)
  addMember(@Payload() payload: AddMemberPayload): Promise<GroupDto> {
    // Payload contains: { groupId, actorId, targetUserId }
    return this.groupsService.addMember(payload);
  }

  @MessagePattern(GROUPS_PATTERNS.REMOVE_MEMBER)
  removeMember(@Payload() payload: RemoveMemberPayload): Promise<GroupDto> {
    // Payload contains: { groupId, actorId, targetUserId }
    return this.groupsService.removeMember(payload);
  }

  @MessagePattern(GROUPS_PATTERNS.DELETE)
  delete(@Payload() payload: DeleteGroupPayload): Promise<boolean> {
    // Payload contains: { groupId, actorId }
    return this.groupsService.delete(payload);
  }

  @MessagePattern(GROUPS_PATTERNS.IS_USER_IN_GROUP)
  isUserInGroup(@Payload() payload: CheckGroupMembershipPayload): Promise<boolean> {
    // Payload contains: { groupId, userId }
    return this.groupsService.isUserInGroup(payload);
  }
}
