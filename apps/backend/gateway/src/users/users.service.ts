import { UserDto } from '@limbo/common';
import { AdminCreateUserPayload, GetUserByIdPayload, USER_PATTERNS, USER_SERVICE } from '@limbo/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AdminCreateUserDto } from './dtos/admin-create-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(USER_SERVICE) private readonly usersClient: ClientProxy) {}

  async ping(): Promise<string> {
    const payload = 'Ping';
    const result = await firstValueFrom(this.usersClient.send(USER_PATTERNS.PING, payload));
    return `${payload}: ${result}`;
  }
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
