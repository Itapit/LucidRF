/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRefreshResponse, LoginResponse, PendingLoginResponse } from '@limbo/common';
import { AuthLoginResponseDto } from '@limbo/users-contracts';
import { Body, Controller, Headers, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

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

    const maxAgeString = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');

    const maxAgeMs = ms(maxAgeString as any) as unknown as number;

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

    const maxAgeString = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const maxAgeMs = ms(maxAgeString as any) as unknown as number;

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

    const maxAgeString = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const maxAgeMs = ms(maxAgeString as any) as unknown as number;

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
