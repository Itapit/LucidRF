import { UserDto, UserStatus } from '@LucidRF/common';
import { AdminCreateUserPayload } from '@LucidRF/users-contracts';
import { Injectable, Logger } from '@nestjs/common';
import { PasswordService } from '../../security';
import { CreateUserRepoDto, toUserDto, UserRepository } from '../domain';
import {
  EmailAlreadyExistsException,
  UsernameAlreadyExistsException,
  UserNotFoundException,
} from '../domain/exceptions';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly passwordService: PasswordService) {}

  /**
   * Creates a new user with a pending status and a temporary password.
   */
  async adminCreateUser(payload: AdminCreateUserPayload): Promise<UserDto> {
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new EmailAlreadyExistsException(payload.email);
    }
    const existingUsername = await this.userRepository.findByUsername(payload.username);
    if (existingUsername) {
      throw new UsernameAlreadyExistsException(payload.username);
    }

    const tempPassword = this.passwordService.generateTemporary();
    const hashedPassword = await this.passwordService.hash(tempPassword);

    const repoDto: CreateUserRepoDto = {
      email: payload.email,
      username: payload.username,
      password: hashedPassword,
      role: payload.role,
      status: UserStatus.PENDING,
    };
    const newUserEntity = await this.userRepository.create(repoDto);
    // TODO: add email or smthing
    Logger.log(`Temp password for ${payload.email}: ${tempPassword}`);

    return toUserDto(newUserEntity);
  }

  /**
   * Gets a user's public profile by ID.
   */
  async getUserById(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return toUserDto(user);
  }
}
