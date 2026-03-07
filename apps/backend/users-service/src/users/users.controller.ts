import { UserDto } from '@LucidRF/common';
import {
  CreateUserPayload,
  GetUserByIdPayload,
  GetUserByIdentifierPayload,
  GetUsersByIdsPayload,
  USER_PATTERNS,
} from '@LucidRF/users-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './application';

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

  @MessagePattern(USER_PATTERNS.GET_USER_BY_IDENTIFIER)
  async getUserByIdentifier(@Payload() payload: GetUserByIdentifierPayload): Promise<UserDto> {
    return this.userService.getUserByIdentifier(payload.identifier);
  }

  @MessagePattern(USER_PATTERNS.GET_USERS_BY_IDS)
  async getUsersByIds(@Payload() payload: GetUsersByIdsPayload): Promise<UserDto[]> {
    return this.userService.getUsersByIds(payload.userIds);
  }
}
