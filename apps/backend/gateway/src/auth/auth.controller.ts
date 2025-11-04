/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoginResponse, PendingLoginResponse } from '@limbo/common';
import { AuthLoginResponseDto } from '@limbo/users-contracts';
import { Body, Controller, Headers, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CompleteSetupDto, LoginDto } from './dtos';
import { PendingJwtGuard } from './guards/pending-jwt.guard';
import ms = require('ms');

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
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
  @UsePipes(new ValidationPipe())
  async completeSetup(
    @Req() req,
    @Body() dto: CompleteSetupDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string
  ): Promise<LoginResponse> {
    const userId = req.user.id;

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
}
