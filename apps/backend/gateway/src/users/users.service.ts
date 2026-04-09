import { SystemRole, UserDto } from '@LucidRF/common';
import { TEAMS_PATTERNS, TEAMS_SERVICE } from '@LucidRF/teams-contracts';
import { CreateUserPayload, GetUserByIdPayload, USER_PATTERNS, USER_SERVICE } from '@LucidRF/users-contracts';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AccessUser } from '../auth/types/access-jwt.types';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_SERVICE) private readonly usersClient: ClientProxy,
    @Inject(TEAMS_SERVICE) private readonly teamsClient: ClientProxy
  ) {}

  async createUser(adminId: string, dto: CreateUserDto): Promise<UserDto> {
    const payload: CreateUserPayload = {
      email: dto.email,
      username: dto.username,
      role: dto.role,
      adminId: adminId,
    };

    return firstValueFrom(this.usersClient.send<UserDto>(USER_PATTERNS.CREATE_USER, payload));
  }

  async getMe(userId: string): Promise<UserDto> {
    const payload: GetUserByIdPayload = { userId };
    return firstValueFrom(this.usersClient.send<UserDto>(USER_PATTERNS.GET_USER_BY_ID, payload));
  }

  async getAllUsers(): Promise<UserDto[]> {
    return firstValueFrom(this.usersClient.send<UserDto[]>(USER_PATTERNS.GET_ALL_USERS, {}));
  }

  async deleteUser(actor: AccessUser, targetId: string): Promise<void> {
    if (actor.role !== SystemRole.ADMIN && actor.userId !== targetId) {
      throw new ForbiddenException('You are not allowed to delete this user');
    }

    // Tell Teams Service to handle user deletion (deletes personal team, removes from groups, etc.)
    await firstValueFrom(this.teamsClient.send(TEAMS_PATTERNS.HANDLE_USER_DELETION, { userId: targetId }));

    // Tell Users Service to delete the user
    await firstValueFrom(this.usersClient.send(USER_PATTERNS.DELETE_USER, { userId: targetId }));
  }
}
