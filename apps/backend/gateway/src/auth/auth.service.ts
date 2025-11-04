import { AuthLoginPayload, CompleteSetupPayload, USER_PATTERNS, USER_SERVICE } from '@limbo/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CompleteSetupDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(@Inject(USER_SERVICE) private readonly usersClient: ClientProxy) {}

  async login(payload: AuthLoginPayload) {
    return this.usersClient.send(USER_PATTERNS.AUTH_LOGIN, payload).toPromise();
  }

  async completeSetup(userId: string, dto: CompleteSetupDto) {
    const payload: CompleteSetupPayload = {
      userId: userId,
      password: dto.password,
    };

    return this.usersClient.send(USER_PATTERNS.AUTH_COMPLETE_SETUP, payload).toPromise();
  }
}
