import { AuthRefreshResponse, isPendingLoginResponse, LoginResponse, PendingLoginResponse } from '@LucidRF/common';
import { AuthLoginResponseDto } from '@LucidRF/users-contracts';
import { Body, Controller, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PassthroughRes, UserAgent } from './decorators';
import { CompleteSetupDto, LoginDto } from './dtos';
import { JwtAuthGuard, PendingJwtGuard, RefreshTokenGuard } from './guards';
import { AuthService, CookieService } from './services';
import { AccessAuthenticatedRequest, PendingAuthenticatedRequest, RefreshAuthenticatedRequest } from './types';

/**
 * Controller responsible for authentication and session management.
 * Handles login, session refresh, logout, and account setup completion.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly cookieService: CookieService) {}

  /**
   * Login user.
   * Authenticates a user with email and password. Sets a refresh token cookie and returns an access token.
   * If account setup is incomplete, returns a pending token instead.
   * @param loginDto Email and password credentials.
   * @param res Express response for setting cookies.
   * @param userAgent Information about the client device.
   * @returns A login response with tokens or a pending token response.
   */
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

  /**
   * Complete account setup.
   * Finalizes account activation by setting a password and establishing a session.
   * @param req Request containing the pending token payload.
   * @param dto The new password to set.
   * @param res Express response for setting cookies.
   * @param userAgent Information about the client device.
   * @returns A full login response with tokens.
   */
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

  /**
   * Refresh session.
   * Issues a new access token and updates the refresh token cookie.
   * @param req Request containing the current refresh token payload.
   * @param res Express response for updating cookies.
   * @param userAgent Information about the client device.
   * @returns A new access token.
   */
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

  /**
   * Logout user.
   * Invalidates the current session and clears the refresh token cookie.
   * @param req Request containing the refresh token payload.
   * @param res Express response for clearing cookies.
   * @returns A status message.
   */
  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(
    @Req() req: RefreshAuthenticatedRequest,
    @PassthroughRes() res: Response
  ): Promise<{ statusCode: number; message: string }> {
    const { jti } = req.user;

    await this.authService.logout(jti);
    this.cookieService.clearRefreshToken(res);

    return { statusCode: HttpStatus.OK, message: 'Logged out successfully' };
  }

  /**
   * Logout all devices.
   * Terminates all active sessions for the current user and clears the cookie.
   * @param req Authenticated user request.
   * @param res Express response for clearing cookies.
   * @returns A status message.
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @Req() req: AccessAuthenticatedRequest,
    @PassthroughRes() res: Response
  ): Promise<{ statusCode: number; message: string }> {
    await this.authService.logoutAll(req.user.userId);

    this.cookieService.clearRefreshToken(res);

    return { statusCode: HttpStatus.OK, message: 'Logged out from all devices' };
  }
}
