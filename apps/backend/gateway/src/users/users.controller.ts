import { UserDto } from '@limbo/common'; // The public response DTO
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AdminCreateUserDto } from './dtos/admin-create-user.dto';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('ping')
  async checkComms(): Promise<string> {
    return this.usersService.ping();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async adminInviteUser(@Body() dto: AdminCreateUserDto, @Request() req): Promise<UserDto> {
    // Get the admin's ID from the token (added by JwtAuthGuard)
    const adminId = req.user.id;

    return this.usersService.adminInviteUser(adminId, dto);
  }
}
