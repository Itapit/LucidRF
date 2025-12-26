/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole, UserStatus } from '@LucidRF/common';
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_PENDING_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
  RefreshTokenDto,
} from '@LucidRF/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { GeneratedTokensDto } from '../../application/dtos';
import { TokenService } from '../../domain';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(JWT_REFRESH_EXPIRES_IN) private readonly jwtRefreshExpiresIn: string,
    @Inject(JWT_PENDING_EXPIRES_IN) private readonly jwtPendingExpiresIn: string,
    @Inject(JWT_ACCESS_EXPIRES_IN) private readonly jwtAccessExpiresIn: string,
    @Inject(JWT_SECRET) private readonly jwtSecret: string
  ) {}

  async generateAuthTokens(userId: string, role: UserRole): Promise<GeneratedTokensDto> {
    const jti = uuidv4();

    const refreshExpiresInMs = ms(this.jwtRefreshExpiresIn as any);
    const refreshExpiresAt = new Date(Date.now() + refreshExpiresInMs);

    const [accessToken, refreshTokenString] = await Promise.all([
      this.signAccessToken(userId, role),
      this.signRefreshToken(userId, jti),
    ]);

    const refreshTokenDto: RefreshTokenDto = {
      token: refreshTokenString,
      expiresAt: refreshExpiresAt,
    };

    return {
      accessToken,
      jti,
      refreshToken: refreshTokenDto,
    };
  }

  async generatePendingToken(userId: string): Promise<string> {
    const payload = { sub: userId, status: UserStatus.PENDING };

    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtPendingExpiresIn as any,
    });
  }

  private signAccessToken(userId: string, role: UserRole): Promise<string> {
    const payload = { sub: userId, role };

    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtAccessExpiresIn as any,
    });
  }

  private signRefreshToken(userId: string, jti: string): Promise<string> {
    const payload = { sub: userId, jti };

    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtRefreshExpiresIn as any,
    });
  }
}
