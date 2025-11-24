import { UserDto } from '@limbo/common';
import { AdminCreateUserPayload, GetUserByIdPayload, USER_PATTERNS } from '@limbo/users-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './users.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(USER_PATTERNS.CREATE_USER)
  async adminCreateUser(@Payload() payload: AdminCreateUserPayload): Promise<UserDto> {
    return this.userService.adminCreateUser(payload);
  }

  @MessagePattern(USER_PATTERNS.GET_USER_BY_ID)
  async getUserById(@Payload() payload: GetUserByIdPayload): Promise<UserDto> {
    return this.userService.getUserById(payload.userId);
  }
}
