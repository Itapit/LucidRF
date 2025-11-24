import { UserStatus } from '@limbo/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PendingJwtPayload, PendingUser } from '../types/pending-jwt.types';

@Injectable()
export class PendingJwtStrategy extends PassportStrategy(Strategy, 'pending-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * This validate method runs only for the "pending" token.
   * It ensures the user's status is PENDING.
   */
  async validate(payload: PendingJwtPayload): Promise<PendingUser> {
    if (payload.status !== UserStatus.PENDING) {
      throw new UnauthorizedException('Invalid token for this action');
    }

    return { userId: payload.sub };
  }
}
