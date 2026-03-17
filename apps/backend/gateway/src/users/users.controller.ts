import { UserDto } from '@LucidRF/common';
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

/**
 * Controller for user profile management and administrative user operations.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get my profile.
   * Retrieves profile details for the currently authenticated user.
   * @param req Authenticated user request.
   * @returns The user's profile details.
   * @throws {UnauthorizedException} If the bearer token is missing or invalid.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AccessAuthenticatedRequest): Promise<UserDto> {
    return this.usersService.getMe(req.user.userId);
  }

  /**
   * Create user (admin only).
   * Restricted operation for creating new system users.
   * @param dto New user details.
   * @param req Authenticated user request.
   * @returns The newly created user record.
   * @throws {ForbiddenException} If the user lacks administrator privileges.
   * @throws {UnauthorizedException} If the bearer token is missing or invalid.
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createUser(@Body() dto: CreateUserDto, @Req() req: AccessAuthenticatedRequest): Promise<UserDto> {
    return this.usersService.createUser(req.user.userId, dto);
  }

  /**
   * Get all users (admin only).
   * Retrieves a list of all registered users. Restricted to administrators.
   * @returns A list of users.
   * @throws {ForbiddenException} If the user lacks administrator privileges.
   */
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllUsers(): Promise<UserDto[]> {
    return this.usersService.getAllUsers();
  }

  /**
   * Delete user by ID.
   * Removes a user from the system.
   * @param req Authenticated user request.
   * @param targetId ID of the user to delete.
   * @throws {ForbiddenException} If the user lacks permission to delete the target user.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: AccessAuthenticatedRequest, @Param('id') targetId: string): Promise<void> {
    return this.usersService.deleteUser(req.user, targetId);
  }
}
