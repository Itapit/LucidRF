/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRefreshResponse, LoginResponse, PendingLoginResponse } from '@LucidRF/common';
import { AuthLoginResponseDto, JWT_REFRESH_EXPIRES_IN } from '@LucidRF/users-contracts';
import { Body, Controller, Headers, HttpStatus, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CompleteSetupDto, LoginDto } from './dtos';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PendingJwtGuard } from './guards/pending-jwt.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessAuthenticatedRequest } from './types/access-jwt.types';
import { PendingAuthenticatedRequest } from './types/pending-jwt.types';
import { RefreshAuthenticatedRequest } from './types/refresh-jwt.types';
import ms = require('ms');

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(JWT_REFRESH_EXPIRES_IN) private readonly jwtRefreshExpiresIn: string
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string
  ): Promise<LoginResponse | PendingLoginResponse> {
    const result = await this.authService.login(loginDto, userAgent);

    if ('pendingToken' in result) {
      return { pendingToken: result.pendingToken };
    }

    const maxAgeMs = ms(this.jwtRefreshExpiresIn as any) as unknown as number;

    res.cookie('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAgeMs,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('complete-setup')
  @UseGuards(PendingJwtGuard)
  async completeSetup(
    @Req() req: PendingAuthenticatedRequest,
    @Body() dto: CompleteSetupDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string
  ): Promise<LoginResponse> {
    const userId = req.user.userId;

    const result = (await this.authService.completeSetup(userId, dto, userAgent)) as AuthLoginResponseDto;

    const maxAgeMs = ms(this.jwtRefreshExpiresIn as any) as unknown as number;

    res.cookie('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAgeMs,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() req: RefreshAuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string
  ): Promise<AuthRefreshResponse> {
    const { userId, jti } = req.user;
    const result = await this.authService.refresh(userId, jti, userAgent);

    const maxAgeMs = ms(this.jwtRefreshExpiresIn as any) as unknown as number;

    res.cookie('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAgeMs,
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(@Req() req: RefreshAuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const { jti } = req.user;

    await this.authService.logout(jti);

    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { statusCode: HttpStatus.OK, message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Req() req: AccessAuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(req.user.userId);

    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { statusCode: HttpStatus.OK, message: 'Logged out from all devices' };
  }
}
