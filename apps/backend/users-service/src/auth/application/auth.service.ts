/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole, UserStatus } from '@LucidRF/common';
import {
  AuthLoginPayload,
  AuthLoginResponseDto,
  AuthLogoutAllPayload,
  AuthLogoutPayload,
  AuthRefreshPayload,
  CompleteSetupPayload,
  JWT_ACCESS_EXPIRES_IN,
  JWT_PENDING_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
  PendingLoginResponseDto,
} from '@LucidRF/users-contracts';
import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { HASH_ROUNDS } from '../../constants';
import { UserEntity } from '../../users/domain/entities';
import { UserRepository } from '../../users/domain/interfaces/user.repository.interface';
import { toUserDto } from '../../users/domain/mappers';
import { RefreshTokenRepository } from '../domain/interfaces/refresh-token.repository.interface';
import { toRefreshTokenDto } from '../domain/mappers';
import { TokenSecurityService } from '../domain/services/security.service';
import ms = require('ms');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly tokenSecurity: TokenSecurityService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    @Inject(JWT_REFRESH_EXPIRES_IN) private readonly jwtRefreshExpiresIn: string,
    @Inject(JWT_PENDING_EXPIRES_IN) private readonly jwtPendingExpiresIn: string,
    @Inject(JWT_ACCESS_EXPIRES_IN) private readonly jwtAccessExpiresIn: string,
    @Inject(JWT_SECRET) private readonly jwtSecret: string
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

    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);
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
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  /**
   * Issues a short-lived token for password setup.
   */
  private async grantPendingToken(user: UserEntity): Promise<PendingLoginResponseDto> {
    const payload = {
      sub: user.id,
      status: UserStatus.PENDING,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtPendingExpiresIn as any,
    });
    return { pendingToken: token };
  }

  /**
   * Issues Access and Refresh tokens for an active user.
   */
  private async grantUserTokens(user: UserEntity, userAgent?: string): Promise<AuthLoginResponseDto> {
    try {
      const jti = uuidv4();
      const expiresInMs = ms(this.jwtRefreshExpiresIn as any) as unknown as number;
      const expiresAt = new Date(Date.now() + expiresInMs);

      // Create returns a RefreshTokenEntity
      const newSession = await this.refreshTokenRepo.create(user.id, jti, expiresAt, userAgent);

      const [accessToken] = await Promise.all([
        this.signAccessToken(user.id, user.role),
        this.signRefreshToken(user.id, jti),
      ]);

      return {
        accessToken,
        refreshToken: toRefreshTokenDto(newSession) as any,
        user: toUserDto(user),
      };
    } catch (e) {
      Logger.error('Failed to grant user tokens:', e);
      const error = new InternalServerErrorException('Could not grant tokens');
      throw new RpcException(error.getResponse());
    }
  }

  // --- Token Signing Helpers ---

  private signAccessToken(userId: string, role: UserRole): Promise<string> {
    const payload = { sub: userId, role };

    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtAccessExpiresIn as any,
    });
  }

  private signRefreshToken(userId: string, jti: string): Promise<string> {
    const payload = { sub: userId, jti: jti };

    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtRefreshExpiresIn as any,
    });
  }
}
