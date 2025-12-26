import {
  AuthLoginPayload,
  AuthLoginResponseDto,
  AuthLogoutAllPayload,
  AuthLogoutPayload,
  AuthRefreshPayload,
  CompleteSetupPayload,
  PendingLoginResponseDto,
  USER_PATTERNS,
  USER_SERVICE,
} from '@LucidRF/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CompleteSetupDto, LoginDto } from '../dtos';

@Injectable()
export class AuthService {
  constructor(@Inject(USER_SERVICE) private readonly usersClient: ClientProxy) {}

  async login(dto: LoginDto, userAgent?: string): Promise<AuthLoginResponseDto | PendingLoginResponseDto> {
    const payload: AuthLoginPayload = {
      email: dto.email,
      password: dto.password,
      userAgent: userAgent,
    };
    return lastValueFrom(
      this.usersClient.send<AuthLoginResponseDto | PendingLoginResponseDto>(USER_PATTERNS.AUTH_LOGIN, payload)
    );
  }

  async completeSetup(userId: string, dto: CompleteSetupDto, userAgent?: string): Promise<AuthLoginResponseDto> {
    const payload: CompleteSetupPayload = {
      userId: userId,
      password: dto.password,
      userAgent: userAgent,
    };
    return lastValueFrom(this.usersClient.send<AuthLoginResponseDto>(USER_PATTERNS.AUTH_COMPLETE_SETUP, payload));
  }

  async refresh(userId: string, jti: string, userAgent?: string): Promise<AuthLoginResponseDto> {
    const payload: AuthRefreshPayload = { userId, jti, userAgent };

    return lastValueFrom(this.usersClient.send<AuthLoginResponseDto>(USER_PATTERNS.AUTH_REFRESH, payload));
  }

  async logout(jti: string): Promise<{ success: boolean }> {
    const payload: AuthLogoutPayload = { jti };

    return lastValueFrom(this.usersClient.send<{ success: boolean }>(USER_PATTERNS.AUTH_LOGOUT, payload));
  }

  async logoutAll(userId: string): Promise<{ success: boolean }> {
    const payload: AuthLogoutAllPayload = { userId };

    return await lastValueFrom(this.usersClient.send<{ success: boolean }>(USER_PATTERNS.AUTH_LOGOUT_ALL, payload));
  }
}
