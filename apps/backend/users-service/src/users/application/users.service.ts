import { UserDto, UserStatus } from '@LucidRF/common';
import { AdminCreateUserPayload } from '@LucidRF/users-contracts';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PasswordService } from '../../security';
import { CreateUserRepoDto, toUserDto, UserRepository } from '../domain';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly passwordService: PasswordService) {}

  /**
   * Creates a new user with a pending status and a temporary password.
   */
  async adminCreateUser(payload: AdminCreateUserPayload): Promise<UserDto> {
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      const error = new ConflictException('User with this email already exists');
      throw new RpcException(error.getResponse());
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
      const error = new NotFoundException('User not found');
      throw new RpcException(error.getResponse());
    }
    return toUserDto(user);
  }
}
