import { UserDto } from '@LucidRF/common';
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AccessAuthenticatedRequest): Promise<UserDto> {
    return this.usersService.getMe(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createUser(@Body() dto: CreateUserDto, @Req() req: AccessAuthenticatedRequest): Promise<UserDto> {
    return this.usersService.createUser(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllUsers(): Promise<UserDto[]> {
    return this.usersService.getAllUsers();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: AccessAuthenticatedRequest, @Param('id') targetId: string): Promise<void> {
    return this.usersService.deleteUser(req.user, targetId);
  }
}
