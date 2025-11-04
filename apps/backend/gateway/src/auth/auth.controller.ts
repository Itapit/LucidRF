import { LoginResponse, PendingLoginResponse } from '@limbo/common';
import { Body, Controller, Post, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import ms = require('ms');

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse | PendingLoginResponse> {
    const result = await this.authService.login(loginDto);

    if ('pendingToken' in result) {
      return { pendingToken: result.pendingToken };
    }

    const maxAgeString = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
