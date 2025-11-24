import { UserDto } from '@limbo/common';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessAuthenticatedRequest } from '../auth/types/access-jwt.types';
import { AdminCreateUserDto } from './dtos/admin-create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('ping')
  async checkComms(): Promise<string> {
    return this.usersService.ping();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AccessAuthenticatedRequest): Promise<UserDto> {
    return this.usersService.getMe(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async adminCreateUser(@Body() dto: AdminCreateUserDto, @Req() req: AccessAuthenticatedRequest): Promise<UserDto> {
    return this.usersService.adminCreateUser(req.user.userId, dto);
  }
}
