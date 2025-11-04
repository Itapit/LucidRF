import { USER_PATTERNS } from '@limbo/users-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  // constructor(private readonly authService: AuthService) {}

  @MessagePattern(USER_PATTERNS.PING)
  handlePing(data: string): string {
    console.log(`Received PING from Gateway: ${data}`);
    return 'PONG from Users Service!';
  }
}
