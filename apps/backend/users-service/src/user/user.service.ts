import { UserDto, UserStatus } from '@limbo/common';
import { AdminCreateUserPayload, CompleteSetupPayload } from '@limbo/users-contracts';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserRepoDto } from './dtos/create-user-repo.dto';
import { UserSchema } from './repository/user.schema';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class UserService {
  private readonly HASH_ROUNDS = 10;

  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Creates a new user with a pending status and a temporary password.
   * This logic is called by the `UsersController` (from an admin request).
   */
  async adminInviteUser(payload: AdminCreateUserPayload): Promise<UserDto> {
    const existingUser = await this.usersRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    //TODO: add logs and log the admin that created this user with payload.adminId

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, this.HASH_ROUNDS);

    const repoDto: CreateUserRepoDto = {
      email: payload.email,
      username: payload.username,
      password: hashedPassword,
      role: payload.role,
      status: UserStatus.PENDING,
    };
    const newUserEntity = await this.usersRepository.create(repoDto);

    // TODO: move this temp password back to the user maybe email?
    console.log(`Temp password for ${payload.email}: ${tempPassword}`);

    return this.mapToDto(newUserEntity);
  }

  /**
   * Activates a PENDING user by setting their permanent password.
   * This logic is called by the `AuthService`.
   */
  async completeUserSetup(payload: CompleteSetupPayload): Promise<UserDto> {
    const { userId, password } = payload;

    const hashedPassword = await bcrypt.hash(password, this.HASH_ROUNDS);

    const updatedUser = await this.usersRepository.update(userId, {
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return this.mapToDto(updatedUser);
  }

  /**
   * Updates a user's refresh token version.
   * This logic is called by the `AuthService` during login/logout.
   */
  async updateRefreshTokenVersion(userId: string, version: string | null): Promise<void> {
    const updatedUser = await this.usersRepository.update(userId, {
      refreshTokenVersion: version,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Gets a user's public profile by ID.
   * This is a "safe" getter.
   */
  async getUserById(id: string): Promise<UserDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
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
