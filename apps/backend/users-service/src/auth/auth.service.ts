import { UserRole, UserStatus } from '@limbo/common';
import {
  AuthLoginPayload,
  AuthLoginResponseDto,
  AuthRefreshPayload,
  AuthRefreshResponse,
  CompleteSetupPayload,
  PendingLoginResponseDto,
} from '@limbo/users-contracts';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserSchema } from '../user/repository/user.schema';
import { UsersRepository } from '../user/repository/users.repository';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
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
    // Handle PENDING user flow
    if (user.status === UserStatus.PENDING) {
      return this.grantPendingToken(user);
    }
    // Handle ACTIVE user flow
    return this.grantUserTokens(user);
  }

  async completeUserSetup(payload: CompleteSetupPayload): Promise<AuthLoginResponseDto> {
    const { userId, password } = payload;

    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new RpcException(new NotFoundException('User not found').getResponse());
    }
    if (user.status !== UserStatus.PENDING) {
      throw new RpcException(new ForbiddenException('User is already active').getResponse());
    }

    const hashedPassword = await bcrypt.hash(password, this.userService.HASH_ROUNDS);
    const updatedUser = await this.usersRepository.update(user.id, {
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    if (!updatedUser) {
      throw new RpcException(new InternalServerErrorException('Failed to activate user').getResponse());
    }

    return this.grantUserTokens(updatedUser);
  }

  /**
   * Validates a refresh token and issues a new access token.
   */
  async refreshAccessToken(payload: AuthRefreshPayload): Promise<AuthRefreshResponse> {
    const { userId, version } = payload;
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new RpcException(new ForbiddenException('User not found').getResponse());
    }

    if (user.refreshTokenVersion !== version) {
      throw new RpcException(new ForbiddenException('Invalid refresh token').getResponse());
    }

    const accessToken = await this.signAccessToken(user.id, user.role);
    return { accessToken };
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
   * Issues a short-lived token for password setup.
   */
  private async grantPendingToken(user: UserSchema): Promise<PendingLoginResponseDto> {
    const payload = {
      sub: user.id,
      status: UserStatus.PENDING,
    };

    const expiresIn = this.configService.getOrThrow<string>('JWT_PENDING_EXPIRES_IN');

    const token = await this.jwtService.signAsync(payload, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: expiresIn as any,
    });
    return { pendingToken: token };
  }

  /**
   * Issues full Access and Refresh tokens for an active user.
   */
  private async grantUserTokens(user: UserSchema): Promise<AuthLoginResponseDto> {
    const refreshTokenVersion = uuidv4();

    try {
      // Update the refresh token version in the DB
      await this.userService.updateRefreshTokenVersion(user.id, refreshTokenVersion);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      const error = new InternalServerErrorException('Could not update user token');
      throw new RpcException(error.getResponse());
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user.id, user.role),
      this.signRefreshToken(user.id, refreshTokenVersion),
    ]);

    return {
      accessToken,
      refreshToken,
      user: this.userService['mapToDto'](user),
    };
  }

  private signAccessToken(userId: string, role: UserRole): Promise<string> {
    const payload = { sub: userId, role };
    const expiresIn = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN');

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: expiresIn as any,
    });
  }

  private signRefreshToken(userId: string, version: string): Promise<string> {
    const payload = { sub: userId, version };
    const expiresIn = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: expiresIn as any,
    });
  }
}
