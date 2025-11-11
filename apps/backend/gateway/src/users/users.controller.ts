import { UserDto } from '@limbo/common';
import { Body, Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  async getMe(@Req() req): Promise<UserDto> {
    const userId = req.user.id;
    return this.usersService.getMe(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async adminCreateUser(@Body() dto: AdminCreateUserDto, @Request() req): Promise<UserDto> {
    const adminId = req.user.id;

    return this.usersService.adminCreateUser(adminId, dto);
  }
}
