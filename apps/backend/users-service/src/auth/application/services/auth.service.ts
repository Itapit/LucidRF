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
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PasswordService } from '../../../security';
import { toUserDto, UserEntity, UserRepository } from '../../../users/domain';
import { RefreshTokenRepository, TokenSecurityService, TokenService } from '../../domain';

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
    if (!user) {
      const error = new UnauthorizedException('Invalid credentials');
      throw new RpcException(error.getResponse());
    }

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
      throw new RpcException(new NotFoundException('User not found').getResponse());
    }
    if (user.status !== UserStatus.PENDING) {
      throw new RpcException(new ForbiddenException('User is already active').getResponse());
    }
    const hashedPassword = await this.passwordService.hash(password);
    const updatedUser = await this.usersRepository.update(user.id, {
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    if (!updatedUser) {
      throw new RpcException(new InternalServerErrorException('Failed to activate user').getResponse());
    }

    return this.grantUserTokens(updatedUser, payload.userAgent);
  }

  /**
   * Main entry point for the refresh command.
   */
  //TODO: fix the errors being thrown here to proper RpcExceptions
  async refreshAccessToken(payload: AuthRefreshPayload): Promise<AuthLoginResponseDto> {
    const { userId, jti } = payload;

    await this.tokenSecurity.validateAndRotate(jti, userId);

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new RpcException(new NotFoundException('User not found').getResponse());
    }

    try {
      return this.grantUserTokens(user, payload.userAgent);
    } catch (e) {
      Logger.error('Error during token granting:', e);
      throw new RpcException(new InternalServerErrorException('Could not grant tokens').getResponse());
    }
  }

  /**
   * Deletes a single refresh token from the database.
   */
  async logout(payload: AuthLogoutPayload): Promise<{ success: true }> {
    try {
      await this.refreshTokenRepo.delete(payload.jti);
      return { success: true };
    } catch (e) {
      Logger.error('Error during logout:', e);
      return { success: true };
    }
  }

  /**
   * Deletes ALL refresh tokens for a user.
   */
  async logoutAll(payload: AuthLogoutAllPayload): Promise<{ success: true }> {
    try {
      await this.refreshTokenRepo.deleteAllForUser(payload.userId);
      return { success: true };
    } catch (e) {
      Logger.error('Error during logout-all:', e);
      return { success: true };
    }
  }

  /**
   * Finds user and compares passwords.
   */
  async validateUser(email: string, pass: string): Promise<UserEntity | null> {
    const user = await this.usersRepository.findByEmailWithCredentials(email);

    if (user && user.password && (await this.passwordService.compare(pass, user.password))) {
      return user;
    }
    return null;
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
    try {
      const tokens = await this.tokenService.generateAuthTokens(user.id, user.role);

      await this.refreshTokenRepo.create(user.id, tokens.jti, tokens.refreshToken.expiresAt, userAgent);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: toUserDto(user),
      };
    } catch (e) {
      Logger.error('Failed to grant user tokens:', e);
      throw new RpcException(new InternalServerErrorException('Could not grant tokens').getResponse());
    }
  }
}
