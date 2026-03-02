import { TeamDto } from '@LucidRF/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import { AddMemberDto, CreateTeamDto, TeamMemberParamsDto, UpdateTeamDto } from './dtos';
import { TeamIdParamsDto } from './dtos/team-id.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async create(@Body() dto: CreateTeamDto, @Req() req: AccessAuthenticatedRequest): Promise<TeamDto> {
    return this.teamsService.create(dto, req.user.userId);
  }

  @Get()
  async findMyTeams(@Req() req: AccessAuthenticatedRequest): Promise<TeamDto[]> {
    return this.teamsService.findByUser(req.user.userId);
  }

  @Get(':teamId')
  async findOne(@Param() params: TeamIdParamsDto): Promise<TeamDto> {
    return this.teamsService.findOne(params.teamId);
  }

  @Patch(':teamId')
  async update(
    @Param() params: TeamIdParamsDto,
    @Body() dto: UpdateTeamDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<TeamDto> {
    return this.teamsService.update(params.teamId, req.user.userId, dto);
  }

  @Post(':teamId/members')
  async addMember(
    @Param() params: TeamIdParamsDto,
    @Body() dto: AddMemberDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<TeamDto> {
    return this.teamsService.addMember(params.teamId, req.user.userId, dto);
  }

  @Delete(':teamId/members/:targetUserId')
  async removeMember(@Param() params: TeamMemberParamsDto, @Req() req: AccessAuthenticatedRequest): Promise<TeamDto> {
    return this.teamsService.removeMember(params.teamId, req.user.userId, params.targetUserId);
  }

  @Delete(':teamId')
  async delete(@Param() params: TeamIdParamsDto, @Req() req: AccessAuthenticatedRequest): Promise<boolean> {
    return this.teamsService.delete(params.teamId, req.user.userId);
  }
}
