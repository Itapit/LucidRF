import { AuthLoginPayload, CompleteSetupPayload, USER_PATTERNS, USER_SERVICE } from '@limbo/users-contracts';
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
}
