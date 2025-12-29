import { UserStatus } from '@LucidRF/common';
import {
  AuthLoginPayload,
  AuthLoginResponseDto,
  AuthLogoutAllPayload,
  AuthLogoutPayload,
  AuthRefreshPayload,
  CompleteSetupPayload,
  PendingLoginResponseDto,
} from '@LucidRF/users-contracts';
import { Injectable } from '@nestjs/common';
import { PasswordService } from '../../../security';
import { toUserDto, UserEntity, UserRepository } from '../../../users/domain';
import { UserNotFoundException } from '../../../users/domain/exceptions';
import {
  InvalidCredentialsException,
  RefreshTokenRepository,
  TokenSecurityService,
  TokenService,
  UserAlreadyActiveException,
} from '../../domain';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenSecurity: TokenSecurityService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly tokenService: TokenService
  ) {}

  /**
   * Main entry point for the login command.
   */
  async login(payload: AuthLoginPayload): Promise<AuthLoginResponseDto | PendingLoginResponseDto> {
    const user = await this.validateUser(payload.email, payload.password);

    if (user.status === UserStatus.PENDING) {
      return this.grantPendingToken(user);
    }

    return this.grantUserTokens(user, payload.userAgent);
  }

  /**
   * Activates a PENDING user and logs them in.
   */
  async completeUserSetup(payload: CompleteSetupPayload): Promise<AuthLoginResponseDto> {
    const { userId, password } = payload;
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }
    if (user.status !== UserStatus.PENDING) {
      throw new UserAlreadyActiveException(userId);
    }

    const hashedPassword = await this.passwordService.hash(password);
    const updatedUser = await this.usersRepository.update(user.id, {
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    return this.grantUserTokens(updatedUser, payload.userAgent);
  }

  /**
   * Main entry point for the refresh command.
   */
  async refreshAccessToken(payload: AuthRefreshPayload): Promise<AuthLoginResponseDto> {
    const { userId, jti } = payload;

    await this.tokenSecurity.validateAndRotate(jti, userId);

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return this.grantUserTokens(user, payload.userAgent);
  }

  /**
   * Deletes a single refresh token from the database.
   */
  async logout(payload: AuthLogoutPayload): Promise<{ success: true }> {
    await this.refreshTokenRepo.delete(payload.jti);
    return { success: true };
  }

  /**
   * Deletes ALL refresh tokens for a user.
   */
  async logoutAll(payload: AuthLogoutAllPayload): Promise<{ success: true }> {
    await this.refreshTokenRepo.deleteAllForUser(payload.userId);
    return { success: true };
  }

  /**
   * Finds user and compares passwords.
   */
  async validateUser(email: string, pass: string): Promise<UserEntity | null> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.usersRepository.findByEmailWithCredentials(normalizedEmail);

    if (!user) {
      throw new InvalidCredentialsException();
    }
    const isMatch = await this.passwordService.compare(pass, user.password || '');

    if (!isMatch) {
      throw new InvalidCredentialsException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result as UserEntity;
  }

  /**
   * Issues a short-lived token for password setup.
   */
  private async grantPendingToken(user: UserEntity): Promise<PendingLoginResponseDto> {
    const token = await this.tokenService.generatePendingToken(user.id);
    return { pendingToken: token };
  }

  /**
   * Issues Access and Refresh tokens for an active user.
   */
  private async grantUserTokens(user: UserEntity, userAgent?: string): Promise<AuthLoginResponseDto> {
    const tokens = await this.tokenService.generateAuthTokens(user.id, user.role);

    await this.refreshTokenRepo.create(user.id, tokens.jti, tokens.refreshToken.expiresAt, userAgent);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: toUserDto(user),
    };
  }
}
