import {
  AuthLoginPayload,
  AuthLogoutAllPayload,
  AuthLogoutPayload,
  AuthRefreshPayload,
  CompleteSetupPayload,
  USER_PATTERNS,
} from '@limbo/users-contracts';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(USER_PATTERNS.PING)
  handlePing(data: string): string {
    console.log(`Received PING from Gateway: ${data}`);
    return 'PONG from Users Service!';
  }

  @MessagePattern(USER_PATTERNS.AUTH_LOGIN)
  @UsePipes(new ValidationPipe())
  handleLogin(@Payload() payload: AuthLoginPayload) {
    return this.authService.login(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_COMPLETE_SETUP)
  @UsePipes(new ValidationPipe())
  handleCompleteSetup(@Payload() payload: CompleteSetupPayload) {
    return this.authService.completeUserSetup(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_REFRESH)
  @UsePipes(new ValidationPipe())
  handleRefresh(@Payload() payload: AuthRefreshPayload) {
    return this.authService.refreshAccessToken(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_LOGOUT)
  @UsePipes(new ValidationPipe())
  handleLogout(@Payload() payload: AuthLogoutPayload) {
    return this.authService.logout(payload);
  }

  @MessagePattern(USER_PATTERNS.AUTH_LOGOUT_ALL)
  @UsePipes(new ValidationPipe())
  handleLogoutAll(@Payload() payload: AuthLogoutAllPayload) {
    return this.authService.logoutAll(payload);
  }
}
