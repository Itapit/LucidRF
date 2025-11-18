import { GroupDto } from '@limbo/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import { AddMemberDto, CreateGroupDto, UpdateGroupDto } from './dtos';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() dto: CreateGroupDto, @Req() req: AccessAuthenticatedRequest): Promise<GroupDto> {
    return this.groupsService.create(dto, req.user.userId);
  }

  @Get('my-groups')
  async findMyGroups(@Req() req: AccessAuthenticatedRequest): Promise<GroupDto[]> {
    return this.groupsService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GroupDto> {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') groupId: string,
    @Body() dto: UpdateGroupDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<GroupDto> {
    return this.groupsService.update(groupId, req.user.userId, dto);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') groupId: string,
    @Body() dto: AddMemberDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<GroupDto> {
    return this.groupsService.addMember(groupId, req.user.userId, dto);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') groupId: string,
    @Param('userId') targetUserId: string,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<GroupDto> {
    return this.groupsService.removeMember(groupId, req.user.userId, targetUserId);
  }

  @Delete(':id')
  async delete(@Param('id') groupId: string, @Req() req: AccessAuthenticatedRequest): Promise<boolean> {
    return this.groupsService.delete(groupId, req.user.userId);
  }
}
