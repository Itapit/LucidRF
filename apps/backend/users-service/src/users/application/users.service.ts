import { UserDto, UserStatus } from '@LucidRF/common';
import { CreateUserPayload } from '@LucidRF/users-contracts';
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
  async createUser(payload: CreateUserPayload): Promise<UserDto> {
    const email = payload.email.toLowerCase();
    const username = payload.username.toLowerCase();

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyExistsException(email);
    }
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new UsernameAlreadyExistsException(username);
    }

    const tempPassword = this.passwordService.generateTemporary();
    const hashedPassword = await this.passwordService.hash(tempPassword);

    const repoDto: CreateUserRepoDto = {
      email: email,
      username: username,
      password: hashedPassword,
      role: payload.role,
      status: UserStatus.PENDING,
    };
    const newUserEntity = await this.userRepository.create(repoDto);

    // TODO: add email or smthing
    Logger.log(`Temp password for ${email}: ${tempPassword}`);

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

  /**
   * Gets a user's public profile by email or username.
   */
  async getUserByIdentifier(identifier: string): Promise<UserDto> {
    const isEmail = identifier.includes('@');
    const user = isEmail
      ? await this.userRepository.findByEmail(identifier.toLowerCase())
      : await this.userRepository.findByUsername(identifier.toLowerCase());

    if (!user) {
      throw new UserNotFoundException(identifier);
    }
    return toUserDto(user);
  }

  /**
   * Gets multiple users by their IDs.
   */
  async getUsersByIds(ids: string[]): Promise<UserDto[]> {
    const users = await this.userRepository.findByIds(ids);
    return users.map((u) => toUserDto(u));
  }

  /**
   * Gets all users.
   */
  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => toUserDto(u));
  }

  /**
   * Deletes a user by ID.
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    await this.userRepository.delete(id);
  }
}
