import { UserDto } from '@limbo/common';
import { AdminCreateUserPayload, USER_PATTERNS } from '@limbo/users-contracts';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(USER_PATTERNS.CREATE_USER)
  @UsePipes(new ValidationPipe())
  async adminInviteUser(@Payload() payload: AdminCreateUserPayload): Promise<UserDto> {
    return this.userService.adminInviteUser(payload);
  }
}
