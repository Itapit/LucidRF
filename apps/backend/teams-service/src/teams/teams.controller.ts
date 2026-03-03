import { TeamDto } from '@LucidRF/common';
import {
  AddMemberPayload,
  CheckTeamMembershipPayload,
  CreateTeamPayload,
  DeleteTeamPayload,
  FindOneTeamPayload,
  GetUserTeamsPayload,
  RemoveMemberPayload,
  TEAMS_PATTERNS,
  UpdateMemberRolePayload,
  UpdateTeamPayload,
} from '@LucidRF/teams-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @MessagePattern(TEAMS_PATTERNS.CREATE)
  create(@Payload() payload: CreateTeamPayload): Promise<TeamDto> {
    // Payload contains: { name, description, ownerId }
    return this.teamsService.create(payload);
  }

  @MessagePattern(TEAMS_PATTERNS.FIND_ONE)
  findOne(@Payload() payload: FindOneTeamPayload): Promise<TeamDto> {
    return this.teamsService.findOne(payload);
  }

  @MessagePattern(TEAMS_PATTERNS.GET_USER_TEAMS)
  findMyTeams(@Payload() payload: GetUserTeamsPayload): Promise<TeamDto[]> {
    return this.teamsService.findMyTeams(payload);
  }

  @MessagePattern(TEAMS_PATTERNS.UPDATE)
  update(@Payload() payload: UpdateTeamPayload): Promise<TeamDto> {
    // Payload contains: { teamId, actorId, name?, description? }
    return this.teamsService.update(payload);
  }

  @MessagePattern(TEAMS_PATTERNS.ADD_MEMBER)
  addMember(@Payload() payload: AddMemberPayload): Promise<TeamDto> {
    // Payload contains: { teamId, actorId, targetUserId }
    return this.teamsService.addMember(payload);
  }

  @MessagePattern(TEAMS_PATTERNS.REMOVE_MEMBER)
  removeMember(@Payload() payload: RemoveMemberPayload): Promise<TeamDto> {
    // Payload contains: { teamId, actorId, targetUserId }
    return this.teamsService.removeMember(payload);
  }

  @MessagePattern(TEAMS_PATTERNS.UPDATE_MEMBER_ROLE)
  updateMemberRole(@Payload() payload: UpdateMemberRolePayload): Promise<TeamDto> {
    return this.teamsService.updateMemberRole(payload);
  }

  @MessagePattern(TEAMS_PATTERNS.DELETE)
  delete(@Payload() payload: DeleteTeamPayload): Promise<boolean> {
    // Payload contains: { teamId, actorId }
    return this.teamsService.delete(payload);
  }

  @MessagePattern(TEAMS_PATTERNS.IS_USER_IN_TEAM)
  isUserInTeam(@Payload() payload: CheckTeamMembershipPayload): Promise<boolean> {
    // Payload contains: { teamId, userId }
    return this.teamsService.isUserInTeam(payload);
  }
}
