import { TeamDto } from '@LucidRF/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import { AddMemberDto, CreateTeamDto, TeamMemberParamsDto, UpdateMemberRoleDto, UpdateTeamDto } from './dtos';
import { TeamIdParamsDto } from './dtos/team-id.dto';
import { TeamsService } from './teams.service';

/**
 * Controller for team management and membership.
 * Handles team creation, membership updates, and role assignments.
 */
@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /**
   * Create a new team.
   * Initializes a new team with the current user as the owner.
   * @param dto Team details including name and description.
   * @param req Authenticated user request.
   * @returns The newly created team record.
   * @throws {UnauthorizedException} If the bearer token is missing or invalid.
   */
  @Post()
  async create(@Body() dto: CreateTeamDto, @Req() req: AccessAuthenticatedRequest): Promise<TeamDto> {
    return this.teamsService.create(dto, req.user.userId);
  }

  /**
   * Get my teams.
   * Retrieves all teams that the currently authenticated user is a member of.
   * @param req Authenticated user request.
   * @returns A list of teams.
   * @throws {UnauthorizedException} If the bearer token is missing or invalid.
   */
  @Get()
  async findMyTeams(@Req() req: AccessAuthenticatedRequest): Promise<TeamDto[]> {
    return this.teamsService.findByUser(req.user.userId);
  }

  /**
   * Get team details by ID.
   * Retrieves detailed information about a specific team.
   * @param params Team ID.
   * @returns Team details.
   * @throws {ForbiddenException} If the user is not a member of the team.
   */
  @Get(':teamId')
  async findOne(@Param() params: TeamIdParamsDto): Promise<TeamDto> {
    return this.teamsService.findOne(params.teamId);
  }

  /**
   * Update team settings.
   * Modifies properties like name, description, and color.
   * @param params Team ID.
   * @param dto Updated properties.
   * @param req Authenticated user request.
   * @returns The updated team record.
   * @throws {ForbiddenException} If the user lacks permission to update the team.
   */
  @Patch(':teamId')
  async update(
    @Param() params: TeamIdParamsDto,
    @Body() dto: UpdateTeamDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<TeamDto> {
    return this.teamsService.update(params.teamId, req.user.userId, dto);
  }

  /**
   * Add a new member to the team.
   * Invites or adds a user to the team with a specific role.
   * @param params Team ID.
   * @param dto Email and role of the new member.
   * @param req Authenticated user request.
   * @returns The updated team record.
   * @throws {ForbiddenException} If the user lacks permission to add members.
   */
  @Post(':teamId/members')
  async addMember(
    @Param() params: TeamIdParamsDto,
    @Body() dto: AddMemberDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<TeamDto> {
    return this.teamsService.addMember(params.teamId, req.user.userId, dto);
  }

  /**
   * Update a team member's role.
   * Changes the permissions/role of an existing member.
   * @param params Team ID and target User ID.
   * @param dto The new role to assign.
   * @param req Authenticated user request.
   * @returns The updated team record.
   * @throws {ForbiddenException} If the user lacks permission to manage roles.
   */
  @Patch(':teamId/members/:targetUserId/role')
  async updateMemberRole(
    @Param() params: TeamMemberParamsDto,
    @Body() dto: UpdateMemberRoleDto,
    @Req() req: AccessAuthenticatedRequest
  ): Promise<TeamDto> {
    return this.teamsService.updateMemberRole(params.teamId, req.user.userId, params.targetUserId, dto);
  }

  /**
   * Remove a member from the team.
   * Removes a member's access to the team.
   * @param params Team ID and target User ID.
   * @param req Authenticated user request.
   * @returns The updated team record.
   * @throws {ForbiddenException} If the user lacks permission to remove members.
   */
  @Delete(':teamId/members/:targetUserId')
  async removeMember(@Param() params: TeamMemberParamsDto, @Req() req: AccessAuthenticatedRequest): Promise<TeamDto> {
    return this.teamsService.removeMember(params.teamId, req.user.userId, params.targetUserId);
  }

  /**
   * Delete team (owner only).
   * Permanently deletes a team and its data.
   * @param params Team ID.
   * @param req Authenticated user request.
   * @returns True if deletion was successful.
   * @throws {ForbiddenException} If the user is not the owner of the team.
   */
  @Delete(':teamId')
  async delete(@Param() params: TeamIdParamsDto, @Req() req: AccessAuthenticatedRequest): Promise<boolean> {
    return this.teamsService.delete(params.teamId, req.user.userId);
  }
}
