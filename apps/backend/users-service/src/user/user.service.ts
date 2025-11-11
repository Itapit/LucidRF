import { UserDto, UserStatus } from '@limbo/common';
import { AdminCreateUserPayload } from '@limbo/users-contracts';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices'; // <-- 1. Import RpcException
import * as bcrypt from 'bcrypt';
import { HASH_ROUNDS } from '../constants';
import { CreateUserRepoDto } from './dtos/create-user-repo.dto';
import { UserRepository } from './repository/user.repository';
import { UserSchema } from './repository/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Creates a new user with a pending status and a temporary password.
   */
  async adminCreateUser(payload: AdminCreateUserPayload): Promise<UserDto> {
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      const error = new ConflictException('User with this email already exists');
      throw new RpcException(error.getResponse());
    }

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, HASH_ROUNDS);

    const repoDto: CreateUserRepoDto = {
      email: payload.email,
      username: payload.username,
      password: hashedPassword,
      role: payload.role,
      status: UserStatus.PENDING,
    };
    const newUserEntity = await this.userRepository.create(repoDto);
    // TODO: add email or smthing
    console.log(`Temp password for ${payload.email}: ${tempPassword}`);

    return this.mapToDto(newUserEntity);
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
    return this.mapToDto(user);
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  /**
   * Maps the internal UserSchema entity to the safe, public UserDto.
   */
  private mapToDto(user: UserSchema): UserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
    };
  }
}
