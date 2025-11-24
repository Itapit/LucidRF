import {
  AuthLoginPayload,
  AuthLogoutAllPayload,
  AuthLogoutPayload,
  AuthRefreshPayload,
  CompleteSetupPayload,
  USER_PATTERNS,
} from '@limbo/users-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(USER_PATTERNS.PING)
  handlePing(data: string): string {
    console.log(`Received PING from Gateway: ${data}`);
    return 'PONG from Users Service!';
  }

  @MessagePattern(USER_PATTERNS.AUTH_LOGIN)
  handleLogin(@Payload() payload: AuthLoginPayload) {
    return this.authService.login(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_COMPLETE_SETUP)
  handleCompleteSetup(@Payload() payload: CompleteSetupPayload) {
    return this.authService.completeUserSetup(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_REFRESH)
  handleRefresh(@Payload() payload: AuthRefreshPayload) {
    return this.authService.refreshAccessToken(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_LOGOUT)
  handleLogout(@Payload() payload: AuthLogoutPayload) {
    return this.authService.logout(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_LOGOUT_ALL)
  handleLogoutAll(@Payload() payload: AuthLogoutAllPayload) {
    return this.authService.logoutAll(payload);
  }
}
