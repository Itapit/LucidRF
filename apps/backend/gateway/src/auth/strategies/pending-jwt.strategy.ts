import { UserStatus } from '@LucidRF/common';
import { JWT_SECRET } from '@LucidRF/users-contracts';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PendingJwtPayload, PendingUser } from '../types';

@Injectable()
export class PendingJwtStrategy extends PassportStrategy(Strategy, 'pending-jwt') {
  constructor(@Inject(JWT_SECRET) jwtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
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
