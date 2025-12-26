import {
  AuthLoginPayload,
  AuthLoginResponseDto,
  AuthLogoutAllPayload,
  AuthLogoutPayload,
  AuthRefreshPayload,
  CompleteSetupPayload,
  PendingLoginResponseDto,
  USER_PATTERNS,
} from '@LucidRF/users-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './application/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(USER_PATTERNS.AUTH_LOGIN)
  handleLogin(@Payload() payload: AuthLoginPayload): Promise<AuthLoginResponseDto | PendingLoginResponseDto> {
    return this.authService.login(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_COMPLETE_SETUP)
  handleCompleteSetup(@Payload() payload: CompleteSetupPayload): Promise<AuthLoginResponseDto> {
    return this.authService.completeUserSetup(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_REFRESH)
  handleRefresh(@Payload() payload: AuthRefreshPayload): Promise<AuthLoginResponseDto> {
    return this.authService.refreshAccessToken(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_LOGOUT)
  handleLogout(@Payload() payload: AuthLogoutPayload): Promise<{ success: true }> {
    return this.authService.logout(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_LOGOUT_ALL)
  handleLogoutAll(@Payload() payload: AuthLogoutAllPayload): Promise<{ success: true }> {
    return this.authService.logoutAll(payload);
  }
}
