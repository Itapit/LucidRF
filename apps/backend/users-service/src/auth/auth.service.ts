/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserDto, UserRole, UserStatus } from '@LucidRF/common';
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
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { HASH_ROUNDS } from '../constants';
import { UserRepository } from '../users/repository/user.repository';
import { UserSchema } from '../users/repository/user.schema';
import { RefreshTokenRepository } from './repository/refresh-token.repository';
import ms = require('ms');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepo: RefreshTokenRepository
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
    const user = await this.validateAndRotateRefreshToken(payload);

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
  async validateUser(email: string, pass: string): Promise<UserSchema | null> {
    const user = await this.usersRepository.findByEmailWithCredentials(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  /**
   * This handles all validation, theft detection, and the DB rotation.
   * It returns the full UserSchema if successful.
   */
  private async validateAndRotateRefreshToken(payload: AuthRefreshPayload): Promise<UserSchema> {
    const { userId, jti } = payload;
    const token = await this.refreshTokenRepo.findByJti(jti);

    if (!token) {
      // Token not in DB. It's either invalid or has already been used.
      const user = await this.usersRepository.findById(userId);
      if (user) {
        // High-risk security event: Nuke all sessions
        await this.refreshTokenRepo.deleteAllForUser(userId);
      }
      throw new RpcException(new ForbiddenException('Refresh token reuse detected').getResponse());
    }

    if (token.userId.toString() !== userId) {
      throw new RpcException(new UnauthorizedException('Invalid credentials').getResponse());
    }

    // Invalidate the token that was just used
    await this.refreshTokenRepo.delete(jti);

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new RpcException(new NotFoundException('User not found').getResponse());
    }

    return user;
  }

  /**
   * Issues a short-lived token for password setup.
   */
  private async grantPendingToken(user: UserSchema): Promise<PendingLoginResponseDto> {
    const payload = {
      sub: user.id,
      status: UserStatus.PENDING,
    };
    const expiresIn = this.configService.getOrThrow<string>('JWT_PENDING_EXPIRES_IN');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn as any,
    });
    return { pendingToken: token };
  }

  /**
   * Issues full Access and Refresh tokens for an active user.
   */
  private async grantUserTokens(user: UserSchema, userAgent?: string): Promise<AuthLoginResponseDto> {
    try {
      // Generate new token details
      const jti = uuidv4();
      const expiresInStr = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
      const expiresInMs = ms(expiresInStr as any) as unknown as number;
      const expiresAt = new Date(Date.now() + expiresInMs);

      await this.refreshTokenRepo.create(user.id, jti, expiresAt, userAgent);

      const [accessToken, refreshToken] = await Promise.all([
        this.signAccessToken(user.id, user.role),
        this.signRefreshToken(user.id, jti),
      ]);

      return {
        accessToken,
        refreshToken,
        user: this.mapToDto(user),
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
    const expiresIn = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN');

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: expiresIn as any,
    });
  }

  private signRefreshToken(userId: string, jti: string): Promise<string> {
    const payload = { sub: userId, jti: jti };
    const expiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: expiresIn as any,
    });
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
