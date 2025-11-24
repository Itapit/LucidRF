import { GroupDto } from '@limbo/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import { AddMemberDto, CreateGroupDto, GroupMemberParamsDto, UpdateGroupDto } from './dtos';
import { GroupIdParamsDto } from './dtos/group-id.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() dto: CreateGroupDto, @Req() req: AccessAuthenticatedRequest): Promise<GroupDto> {
    return this.groupsService.create(dto, req.user.userId);
  }

  @Get()
  async findMyGroups(@Req() req: AccessAuthenticatedRequest): Promise<GroupDto[]> {
    return this.groupsService.findByUser(req.user.userId);
  }

  @Get(':groupId')
  async findOne(@Param() params: GroupIdParamsDto): Promise<GroupDto> {
    return this.groupsService.findOne(params.groupId);
  }

  @Patch(':groupId')
  async update(
    @Param() params: GroupIdParamsDto,
    @Body() dto: UpdateGroupDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<GroupDto> {
    return this.groupsService.update(params.groupId, req.user.userId, dto);
  }

  @Post(':groupId/members')
  async addMember(
    @Param() params: GroupIdParamsDto,
    @Body() dto: AddMemberDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<GroupDto> {
    return this.groupsService.addMember(params.groupId, req.user.userId, dto);
  }

  @Delete(':groupId/members/:userId')
  async removeMember(@Param() params: GroupMemberParamsDto, @Req() req: AccessAuthenticatedRequest): Promise<GroupDto> {
    return this.groupsService.removeMember(params.groupId, req.user.userId, params.userId);
  }

  @Delete(':groupId')
  async delete(@Param() params: GroupIdParamsDto, @Req() req: AccessAuthenticatedRequest): Promise<boolean> {
    return this.groupsService.delete(params.groupId, req.user.userId);
  }
}
