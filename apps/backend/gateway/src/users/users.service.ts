import { UserDto } from '@LucidRF/common';
import { AdminCreateUserPayload, GetUserByIdPayload, USER_PATTERNS, USER_SERVICE } from '@LucidRF/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AdminCreateUserDto } from './dtos/admin-create-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(USER_SERVICE) private readonly usersClient: ClientProxy) {}

  async adminCreateUser(adminId: string, dto: AdminCreateUserDto): Promise<UserDto> {
    const payload: AdminCreateUserPayload = {
      email: dto.email,
      username: dto.username,
      role: dto.role,
      adminId: adminId,
    };

    return this.usersClient.send<UserDto>(USER_PATTERNS.CREATE_USER, payload).toPromise();
  }

  async getMe(userId: string): Promise<UserDto> {
    const payload: GetUserByIdPayload = { userId };
    return this.usersClient.send<UserDto>(USER_PATTERNS.GET_USER_BY_ID, payload).toPromise();
  }
}
