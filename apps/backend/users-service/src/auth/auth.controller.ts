import { AuthLoginPayload, USER_PATTERNS } from '@limbo/users-contracts';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
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
}
