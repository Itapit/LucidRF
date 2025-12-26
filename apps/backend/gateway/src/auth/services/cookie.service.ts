/* eslint-disable @typescript-eslint/no-explicit-any */
import { JWT_REFRESH_EXPIRES_IN, RefreshTokenDto } from '@LucidRF/users-contracts';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import ms from 'ms';
import { REFRESH_TOKEN } from '../constants';

@Injectable()
export class CookieService {
  private readonly refreshCookieName = REFRESH_TOKEN;

  constructor(@Inject(JWT_REFRESH_EXPIRES_IN) private readonly jwtRefreshExpiresIn: string) {}

  /**
   * Sets the refresh token cookie.
   */
  setRefreshToken(res: Response, tokenData: RefreshTokenDto) {
    let expires: Date;

    if (tokenData.expiresAt) {
      expires = new Date(tokenData.expiresAt);
    } else {
      // Fallback: Calculate based on the environment variable (e.g., "7d")
      const expiresInMs = ms(this.jwtRefreshExpiresIn as any) as unknown as number;
      expires = new Date(Date.now() + expiresInMs);
      Logger.warn(`CookieService used fallback expiration: ${this.jwtRefreshExpiresIn}`);
    }

    res.cookie(this.refreshCookieName, tokenData.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: expires,
    });
  }

  /**
   * Clears the refresh token cookie.
   */
  clearRefreshToken(res: Response) {
    res.clearCookie(this.refreshCookieName, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
  }
}
