import {
  AuthLoginPayload,
  AuthLoginResponseDto,
  AuthLogoutAllPayload,
  AuthLogoutPayload,
  AuthRefreshPayload,
  CompleteSetupPayload,
  USER_PATTERNS,
  USER_SERVICE,
} from '@LucidRF/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CompleteSetupDto, LoginDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(@Inject(USER_SERVICE) private readonly usersClient: ClientProxy) {}

  async login(dto: LoginDto, userAgent?: string) {
    const payload: AuthLoginPayload = {
      email: dto.email,
      password: dto.password,
      userAgent: userAgent,
    };
    return this.usersClient.send(USER_PATTERNS.AUTH_LOGIN, payload).toPromise();
  }

  async completeSetup(userId: string, dto: CompleteSetupDto, userAgent?: string) {
    const payload: CompleteSetupPayload = {
      userId: userId,
      password: dto.password,
      userAgent: userAgent,
    };

    return this.usersClient.send(USER_PATTERNS.AUTH_COMPLETE_SETUP, payload).toPromise();
  }

  async refresh(userId: string, jti: string, userAgent?: string): Promise<AuthLoginResponseDto> {
    const payload: AuthRefreshPayload = { userId, jti, userAgent };

    return this.usersClient.send<AuthLoginResponseDto>(USER_PATTERNS.AUTH_REFRESH, payload).toPromise();
  }

  async logout(jti: string) {
    const payload: AuthLogoutPayload = { jti };
    return this.usersClient.send(USER_PATTERNS.AUTH_LOGOUT, payload).toPromise();
  }

  async logoutAll(userId: string) {
    const payload: AuthLogoutAllPayload = { userId };
    return this.usersClient.send(USER_PATTERNS.AUTH_LOGOUT_ALL, payload).toPromise();
  }
}
