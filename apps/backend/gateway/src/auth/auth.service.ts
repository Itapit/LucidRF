import { AuthLoginPayload, USER_PATTERNS, USER_SERVICE } from '@limbo/users-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(@Inject(USER_SERVICE) private readonly usersClient: ClientProxy) {}

  async login(payload: AuthLoginPayload) {
    return this.usersClient.send(USER_PATTERNS.AUTH_LOGIN, payload).toPromise();
  }
}
