import { AuthRefreshResponse, isPendingLoginResponse, LoginResponse, PendingLoginResponse } from '@LucidRF/common';
import { AuthLoginResponseDto } from '@LucidRF/users-contracts';
import { Body, Controller, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PassthroughRes, UserAgent } from './decorators';
import { CompleteSetupDto, LoginDto } from './dtos';
import { JwtAuthGuard, PendingJwtGuard, RefreshTokenGuard } from './guards';
import { AuthService, CookieService } from './services';
import { AccessAuthenticatedRequest, PendingAuthenticatedRequest, RefreshAuthenticatedRequest } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly cookieService: CookieService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @PassthroughRes() res: Response,
    @UserAgent() userAgent: string
  ): Promise<LoginResponse | PendingLoginResponse> {
    const result = await this.authService.login(loginDto, userAgent);

    if (isPendingLoginResponse(result)) {
      const pendingResponse: PendingLoginResponse = {
        pendingToken: result.pendingToken,
      };
      return pendingResponse;
    }
    const loginResult = result as AuthLoginResponseDto;

    this.cookieService.setRefreshToken(res, loginResult.refreshToken);

    const loginResponse: LoginResponse = {
      accessToken: loginResult.accessToken,
      user: loginResult.user,
    };
    return loginResponse;
  }

  @Post('complete-setup')
  @UseGuards(PendingJwtGuard)
  async completeSetup(
    @Req() req: PendingAuthenticatedRequest,
    @Body() dto: CompleteSetupDto,
    @PassthroughRes() res: Response,
    @UserAgent() userAgent: string
  ): Promise<LoginResponse> {
    const userId = req.user.userId;

    const result = await this.authService.completeSetup(userId, dto, userAgent);

    this.cookieService.setRefreshToken(res, result.refreshToken);

    const response: LoginResponse = {
      accessToken: result.accessToken,
      user: result.user,
    };
    return response;
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() req: RefreshAuthenticatedRequest,
    @PassthroughRes() res: Response,
    @UserAgent() userAgent: string
  ): Promise<AuthRefreshResponse> {
    const { userId, jti } = req.user;
    const result = await this.authService.refresh(userId, jti, userAgent);

    this.cookieService.setRefreshToken(res, result.refreshToken);

    const response: AuthRefreshResponse = {
      accessToken: result.accessToken,
    };
    return response;
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(@Req() req: RefreshAuthenticatedRequest, @PassthroughRes() res: Response) {
    const { jti } = req.user;

    await this.authService.logout(jti);
    this.cookieService.clearRefreshToken(res);

    return { statusCode: HttpStatus.OK, message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Req() req: AccessAuthenticatedRequest, @PassthroughRes() res: Response) {
    await this.authService.logoutAll(req.user.userId);

    this.cookieService.clearRefreshToken(res);

    return { statusCode: HttpStatus.OK, message: 'Logged out from all devices' };
  }
}
