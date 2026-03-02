/* eslint-disable @typescript-eslint/no-explicit-any */
import { SystemRole, UserStatus } from '@LucidRF/common';
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
import { TokenGenerationException, TokenService } from '../../domain';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(JWT_REFRESH_EXPIRES_IN) private readonly jwtRefreshExpiresIn: string,
    @Inject(JWT_PENDING_EXPIRES_IN) private readonly jwtPendingExpiresIn: string,
    @Inject(JWT_ACCESS_EXPIRES_IN) private readonly jwtAccessExpiresIn: string,
    @Inject(JWT_SECRET) private readonly jwtSecret: string
  ) {
    this.validateTimeFormats();
  }

  private validateTimeFormats() {
    const timeConfigs = [
      { name: JWT_ACCESS_EXPIRES_IN, value: this.jwtAccessExpiresIn },
      { name: JWT_REFRESH_EXPIRES_IN, value: this.jwtRefreshExpiresIn },
      { name: JWT_PENDING_EXPIRES_IN, value: this.jwtPendingExpiresIn },
    ];

    for (const config of timeConfigs) {
      if (ms(config.value as any) === undefined) {
        throw new TokenGenerationException(
          `Fatal Config Error: ${config.name} has invalid value "${config.value}". Expected a time string (e.g. "15m", "7d").`
        );
      }
    }
  }

  async generateAuthTokens(userId: string, role: SystemRole): Promise<GeneratedTokensDto> {
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

  private signAccessToken(userId: string, role: SystemRole): Promise<string> {
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
